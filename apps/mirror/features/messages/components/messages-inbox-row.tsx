"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@feel-good/ui/primitives/avatar";
import { cn } from "@feel-good/utils/cn";
import { type ViewerInboxRow } from "../types";
import { buildChatConversationHref } from "../lib/build-chat-conversation-href";
import { formatRelativeTime } from "../../chat/utils/format-relative-time";

type MessagesInboxRowProps = {
  row: ViewerInboxRow;
};

export function MessagesInboxRow({ row }: MessagesInboxRowProps) {
  const href = buildChatConversationHref(row.username, row.conversationId);
  const displayLabel = row.displayName ?? `@${row.username}`;
  const isArchived = row.status === "archived";

  return (
    <Link
      href={href}
      data-slot="messages-inbox-row"
      data-status={row.status}
      className={cn(
        "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50",
        isArchived && "opacity-60",
      )}
    >
      <Avatar className="size-10 shrink-0">
        {row.avatarUrl && <AvatarImage src={row.avatarUrl} alt={displayLabel} />}
        <AvatarFallback>{displayLabel.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-medium">{displayLabel}</span>
          {row.lastActivityAt !== null && (
            <span className="shrink-0 text-xs text-muted-foreground">
              {formatRelativeTime(row.lastActivityAt)}
            </span>
          )}
        </div>

        {row.lastMessagePreview !== null && (
          <p className="truncate text-sm text-muted-foreground">
            {row.lastMessagePreview}
          </p>
        )}
      </div>
    </Link>
  );
}
