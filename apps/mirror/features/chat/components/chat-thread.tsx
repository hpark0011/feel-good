"use client";

import type { UIMessage } from "@convex-dev/agent/react";
import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { ArcSphere } from "../../../components/animated-geometries/arc-sphere";
import { useChatContext } from "../context/chat-context";
import { useChat } from "../hooks/use-chat";
import { useMockChat } from "../hooks/use-mock-chat";
import { ChatConversationListSheet } from "./chat-conversation-list-sheet";
import { ChatHeader } from "./chat-header";
import { ChatInput } from "./chat-input";
import { ChatMessageList } from "./chat-message-list";

export function ChatThread() {
  const searchParams = useSearchParams();
  const isMock = searchParams.get("mockChat") === "1";

  if (isMock) {
    return <MockChatActiveThread />;
  }

  return <ChatThreadInner />;
}

/** Original ChatThread logic — only rendered when not in mock mode. */
function ChatThreadInner() {
  const {
    routeResolution,
    profileName,
    avatarUrl,
    conversations,
    setConversationId,
    startNewConversation,
    closeChat,
    headerAddon,
  } = useChatContext();

  const [conversationListOpen, setConversationListOpen] = useState(false);
  const openConversationList = useCallback(
    () => setConversationListOpen(true),
    [],
  );
  const activeConversationId = routeResolution.status === "ready"
    ? routeResolution.conversationId
    : null;

  const conversationListSheet = (
    <ChatConversationListSheet
      open={conversationListOpen}
      onOpenChange={setConversationListOpen}
      conversations={conversations}
      activeConversationId={activeConversationId}
      onSelect={setConversationId}
    />
  );

  if (routeResolution.status === "resolving") {
    return (
      <div className="flex flex-col h-full relative">
        {headerAddon}
        {conversationListSheet}
        <div className="absolute top-0 left-0 right-0 z-10 bg-linear-to-b from-transparent to-transparent h-12">
          <ChatHeader
            profileName={profileName}
            avatarUrl={avatarUrl}
            onProfileClick={closeChat}
            onNewConversation={startNewConversation}
            onOpenConversationList={openConversationList}
          />
        </div>
        <div className="flex-1 flex items-center justify-center pb-20">
          <ArcSphere />
        </div>
      </div>
    );
  }

  if (routeResolution.status === "invalid") {
    return (
      <div className="flex flex-col h-full relative">
        {headerAddon}
        {conversationListSheet}
        <ChatHeader
          profileName={profileName}
          avatarUrl={avatarUrl}
          onProfileClick={closeChat}
          onNewConversation={startNewConversation}
          onOpenConversationList={openConversationList}
        />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">
            This conversation is not available.
          </p>
        </div>
      </div>
    );
  }

  // ready | new_conversation | empty — mount useChat
  return <ChatActiveThread />;
}

// ─── Shared layout ────────────────────────────────────────────────────────────

type ChatActiveThreadLayoutProps = {
  messages: UIMessage[];
  sendMessage: (content: string) => void;
  retryMessage: () => void;
  isStreaming: boolean;
  conversationNotFound: boolean;
  status: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted";
  loadMore: (numItems: number) => void;
  sendError: string | null;
  clearSendError: () => void;
  sendAnimationKey: string | null;
  // Context values
  profileName: string;
  avatarUrl: string | null;
  closeChat: () => void;
  startNewConversation: () => void;
  headerAddon?: React.ReactNode;
  conversationListSheet: React.ReactNode;
  openConversationList: () => void;
};

function ChatActiveThreadLayout({
  messages,
  sendMessage,
  retryMessage,
  isStreaming,
  conversationNotFound,
  status,
  loadMore,
  sendError,
  clearSendError,
  sendAnimationKey,
  profileName,
  avatarUrl,
  closeChat,
  startNewConversation,
  headerAddon,
  conversationListSheet,
  openConversationList,
}: ChatActiveThreadLayoutProps) {
  if (conversationNotFound) {
    return (
      <div className="flex flex-col h-full relative">
        {headerAddon}
        {conversationListSheet}
        <ChatHeader
          profileName={profileName}
          avatarUrl={avatarUrl}
          onProfileClick={closeChat}
          onNewConversation={startNewConversation}
          onOpenConversationList={openConversationList}
        />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">
            This conversation is not available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {headerAddon}
      {conversationListSheet}
      <div className="absolute top-0 left-0 right-0 z-10 bg-linear-to-b from-transparent to-transparent h-12">
        <ChatHeader
          profileName={profileName}
          avatarUrl={avatarUrl}
          onProfileClick={closeChat}
          onNewConversation={startNewConversation}
          onOpenConversationList={openConversationList}
        />
      </div>

      <ChatMessageList
        messages={messages}
        avatarUrl={avatarUrl}
        profileName={profileName}
        status={status}
        loadMore={loadMore}
        onRetry={retryMessage}
        sendAnimationKey={sendAnimationKey}
      />

      <div className="absolute bottom-0 w-full mx-auto bg-linear-to-t from-background via-30% via-background to-transparent">
        <ChatInput
          profileName={profileName}
          isStreaming={isStreaming}
          onSend={sendMessage}
          sendError={sendError}
          onClearError={clearSendError}
        />
      </div>
    </div>
  );
}

// ─── Real chat thread ─────────────────────────────────────────────────────────

function ChatActiveThread() {
  const {
    profileOwnerId,
    profileName,
    avatarUrl,
    conversationId,
    conversations,
    routeResolution,
    setConversationId,
    startNewConversation,
    closeChat,
    headerAddon,
  } = useChatContext();

  const [conversationListOpen, setConversationListOpen] = useState(false);
  const openConversationList = useCallback(
    () => setConversationListOpen(true),
    [],
  );
  const activeConversationId = routeResolution.status === "ready"
    ? routeResolution.conversationId
    : null;

  const {
    messages,
    sendMessage,
    retryMessage,
    isStreaming,
    conversationNotFound,
    status,
    loadMore,
    sendError,
    clearSendError,
    sendAnimationKey,
  } = useChat({
    profileOwnerId,
    conversationId,
    onConversationCreated: setConversationId,
  });

  return (
    <ChatActiveThreadLayout
      messages={messages}
      sendMessage={sendMessage}
      retryMessage={retryMessage}
      isStreaming={isStreaming}
      conversationNotFound={conversationNotFound}
      status={status}
      loadMore={loadMore}
      sendError={sendError}
      clearSendError={clearSendError}
      sendAnimationKey={sendAnimationKey}
      profileName={profileName}
      avatarUrl={avatarUrl}
      closeChat={closeChat}
      startNewConversation={startNewConversation}
      headerAddon={headerAddon}
      conversationListSheet={
        <ChatConversationListSheet
          open={conversationListOpen}
          onOpenChange={setConversationListOpen}
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelect={setConversationId}
        />
      }
      openConversationList={openConversationList}
    />
  );
}

// ─── Mock chat thread ─────────────────────────────────────────────────────────

function MockChatActiveThread() {
  const {
    profileName,
    avatarUrl,
    closeChat,
    startNewConversation,
    headerAddon,
  } = useChatContext();

  const {
    messages,
    sendMessage,
    retryMessage,
    isStreaming,
    conversationNotFound,
    status,
    loadMore,
    sendError,
    clearSendError,
    sendAnimationKey,
  } = useMockChat();

  const noop = useCallback(() => {}, []);

  return (
    <ChatActiveThreadLayout
      messages={messages}
      sendMessage={sendMessage}
      retryMessage={retryMessage}
      isStreaming={isStreaming}
      conversationNotFound={conversationNotFound}
      status={status}
      loadMore={loadMore}
      sendError={sendError}
      clearSendError={clearSendError}
      sendAnimationKey={sendAnimationKey}
      profileName={profileName}
      avatarUrl={avatarUrl}
      closeChat={closeChat}
      startNewConversation={startNewConversation}
      headerAddon={headerAddon}
      conversationListSheet={null}
      openConversationList={noop}
    />
  );
}
