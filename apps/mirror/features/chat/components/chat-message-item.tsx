"use client";

import { memo } from "react";
import type { UIMessage } from "@convex-dev/agent/react";
import { useSmoothText } from "@convex-dev/agent/react";
import {
  ChatMessage,
  ChatMessageAvatar,
  ChatMessageBubble,
  ChatMessageContent,
  ChatMessageError,
  ChatMessageLoading,
} from "@feel-good/ui/components/chat-message";
import { getProfileInitials } from "@/features/profile/lib/get-profile-initials";
import { BookFlip } from "@/components/animated-geometries/book-flip";

export const ChatMessageItem = memo(function ChatMessageItem({
  message,
  avatarUrl,
  profileName,
  onRetry,
  animateSend,
}: {
  message: UIMessage & { role: "user" | "assistant" };
  avatarUrl: string | null;
  profileName: string;
  onRetry?: () => void;
  animateSend?: boolean;
}) {
  const isUser = message.role === "user";
  const isStreaming = message.status === "streaming";
  const isFailed = message.status === "failed";

  const [smoothText] = useSmoothText(message.text, {
    startStreaming: isStreaming,
  });
  const displayText = isStreaming ? smoothText : message.text;

  const variant = isUser ? "sent" : "received";

  return (
    <ChatMessage variant={variant}>
      {!isUser && (
        <ChatMessageAvatar
          src={avatarUrl}
          alt={profileName}
          fallback={getProfileInitials(profileName)}
        />
      )}
      <ChatMessageContent>
        <ChatMessageBubble
          variant={variant}
          className={animateSend
            ? "animate-message-send origin-bottom-right"
            : undefined}
        >
          {displayText}
          {isStreaming && !displayText && isUser && <ChatMessageLoading />}
          {isStreaming && !displayText && <BookFlip />}
        </ChatMessageBubble>
        {isFailed && <ChatMessageError onRetry={onRetry} />}
      </ChatMessageContent>
    </ChatMessage>
  );
});
