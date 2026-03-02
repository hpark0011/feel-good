"use client";

import * as React from "react";
import type { Id } from "@feel-good/convex/convex/_generated/dataModel";
import { cn } from "@feel-good/utils/cn";
import type { Conversation } from "../types";
import { formatRelativeTime } from "../utils/format-relative-time";

/**
 * Primitive components for conversation list.
 */

function ConversationListEmpty() {
  return (
    <div
      data-slot="conversation-list-empty"
      className="flex items-center justify-center py-8 px-4"
    >
      <p className="text-sm text-muted-foreground">No conversations yet</p>
    </div>
  );
}

function ConversationListItem({
  className,
  isActive,
  ...props
}: React.ComponentProps<"button"> & { isActive?: boolean }) {
  return (
    <button
      data-slot="conversation-list-item"
      data-active={isActive || undefined}
      type="button"
      className={cn(
        "flex flex-col gap-0.5 px-4 py-3 text-left",
        "transition-colors hover:bg-muted/50",
        isActive && "bg-muted",
        className,
      )}
      {...props}
    />
  );
}

function ConversationListItemTitle({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="conversation-list-item-title"
      className={cn("text-sm font-medium truncate", className)}
      {...props}
    />
  );
}

function ConversationListItemTimestamp({
  className,
  timestamp,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & { timestamp: number }) {
  return (
    <span
      data-slot="conversation-list-item-timestamp"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    >
      {formatRelativeTime(timestamp)}
    </span>
  );
}

/**
 * Exported composed components.
 */

type ConversationListProps = {
  conversations: Conversation[];
  activeConversationId: Id<"conversations"> | null;
  onSelect: (id: Id<"conversations">) => void;
};

function ConversationList({
  conversations,
  activeConversationId,
  onSelect,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return <ConversationListEmpty />;
  }

  return (
    <div data-slot="conversation-list" className="flex flex-col">
      {conversations.map((conversation) => (
        <ConversationListItem
          key={conversation._id}
          isActive={conversation._id === activeConversationId}
          onClick={() => onSelect(conversation._id)}
        >
          <ConversationListItemTitle>
            {conversation.title}
          </ConversationListItemTitle>
          <ConversationListItemTimestamp
            timestamp={conversation._creationTime}
          />
        </ConversationListItem>
      ))}
    </div>
  );
}

export { ConversationList };
export type { ConversationListProps };
