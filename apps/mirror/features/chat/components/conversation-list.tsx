"use client";

import type { Conversation } from "../types";
import type { Id } from "@feel-good/convex/convex/_generated/dataModel";
import { cn } from "@feel-good/utils/cn";
import { formatRelativeTime } from "../utils/format-relative-time";

type ConversationListProps = {
  conversations: Conversation[];
  activeConversationId: Id<"conversations"> | null;
  onSelect: (conversationId: Id<"conversations">) => void;
};

export function ConversationList({
  conversations,
  activeConversationId,
  onSelect,
}: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 px-4">
        <p className="text-sm text-muted-foreground">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {conversations.map((conversation) => {
        const isActive = conversation._id === activeConversationId;

        return (
          <button
            key={conversation._id}
            type="button"
            onClick={() => onSelect(conversation._id)}
            className={cn(
              "flex flex-col gap-0.5 px-4 py-3 text-left",
              "transition-colors hover:bg-muted/50",
              isActive && "bg-muted",
            )}
          >
            <span className="text-sm font-medium truncate">
              {conversation.title}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(conversation._creationTime)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
