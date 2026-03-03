"use client";

import { ChatProvider, ChatThread } from "@/features/chat";
import { useProfileRouteData } from "../_providers/profile-route-data-context";
import { useChatRouteController } from "../_providers/chat-route-controller";

export function ChatPanel() {
  const { profile } = useProfileRouteData();
  const { conversationId, handleConversationIdChange, handleBack } =
    useChatRouteController();

  return (
    <ChatProvider
      profileOwnerId={profile._id}
      profileName={profile.name}
      avatarUrl={profile.avatarUrl ?? null}
      conversationId={conversationId}
      onConversationIdChange={handleConversationIdChange}
    >
      <ChatThread onBack={handleBack} />
    </ChatProvider>
  );
}
