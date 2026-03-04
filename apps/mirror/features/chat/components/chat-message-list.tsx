"use client";

import type { UIMessage } from "@convex-dev/agent/react";
import { cn } from "@feel-good/utils/cn";
import * as React from "react";
import { ChatMessageItem } from "./chat-message-item";

/* Internal building-block components — not exported. */

/** Shared animated 3-dot loading primitive. */
function ChatMessageDotsLoader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-message-dots-loader"
      className={cn("flex gap-1", className)}
      {...props}
    >
      <span className="size-1 rounded-full bg-muted-foreground/40 animate-pulse" />
      <span className="size-1 rounded-full bg-muted-foreground/40 animate-pulse [animation-delay:150ms]" />
      <span className="size-1 rounded-full bg-muted-foreground/40 animate-pulse [animation-delay:300ms]" />
    </div>
  );
}

/** Full-height centered loading state shown while the first page loads. */
function ChatMessageLoadingState({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-message-loading-state"
      className={cn("flex-1 flex items-center justify-center", className)}
      {...props}
    >
      <ChatMessageDotsLoader />
    </div>
  );
}

/** Greeting shown when no messages exist yet. */
function ChatMessageEmptyState({
  className,
  profileName,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & { profileName: string }) {
  return (
    <div
      data-slot="chat-message-empty-state"
      className={cn("flex-1 flex items-center justify-center px-6", className)}
      {...props}
    >
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Hi! I&apos;m {profileName}&apos;s digital clone.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Ask me anything about their work and ideas.
        </p>
      </div>
    </div>
  );
}

/** Top-of-list loading indicator during infinite scroll. */
function ChatMessageLoadingMore({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-message-loading-more"
      className={cn("flex justify-center py-2", className)}
      {...props}
    >
      <ChatMessageDotsLoader />
    </div>
  );
}

/** Scrollable container for the message list. */
function ChatMessageScrollArea({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="chat-message-scroll-area"
      className={cn(
        "flex-1 overflow-y-auto overscroll-y-contain px-4 pt-18 pb-[160px]",
        className,
      )}
      {...props}
    />
  );
}

/* Composed exports — consumed by chat-thread. */

type ChatMessageListProps = {
  messages: UIMessage[];
  avatarUrl: string | null;
  profileName: string;
  status: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted";
  loadMore: (numItems: number) => void;
  onRetry?: () => void;
};

function ChatMessageList({
  messages,
  avatarUrl,
  profileName,
  status,
  loadMore,
  onRetry,
}: ChatMessageListProps) {
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const prevLastKeyRef = React.useRef<string | undefined>(undefined);

  // Auto-scroll only on tail appends (new messages), not history prepends
  const lastKey = messages.at(-1)?.key;
  React.useEffect(() => {
    if (lastKey && lastKey !== prevLastKeyRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    prevLastKeyRef.current = lastKey;
  }, [lastKey]);

  // Load more on scroll to top
  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || status !== "CanLoadMore") return;

    function handleScroll() {
      if (container!.scrollTop < 100) {
        loadMore(20);
      }
    }

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [status, loadMore]);

  if (status === "LoadingFirstPage") {
    return <ChatMessageLoadingState />;
  }

  if (messages.length === 0) {
    return <ChatMessageEmptyState profileName={profileName} />;
  }

  return (
    <ChatMessageScrollArea ref={scrollContainerRef}>
      {status === "LoadingMore" && <ChatMessageLoadingMore />}

      <div className="flex flex-col gap-3">
        {messages
          .filter(
            (m): m is typeof m & { role: "user" | "assistant" } =>
              m.role === "user" || m.role === "assistant",
          )
          .map((message) => (
            <ChatMessageItem
              key={message.key}
              message={message}
              avatarUrl={message.role === "assistant" ? avatarUrl : null}
              profileName={profileName}
              onRetry={message.status === "failed" ? onRetry : undefined}
            />
          ))}
      </div>

      <div ref={bottomRef} />
    </ChatMessageScrollArea>
  );
}

export { ChatMessageList };
export type { ChatMessageListProps };
