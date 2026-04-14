"use client";

import { Button } from "@feel-good/ui/primitives/button";
import { Skeleton } from "@feel-good/ui/primitives/skeleton";
import { useViewerConversations } from "../hooks/use-viewer-conversations";
import { MessagesInboxRow } from "./messages-inbox-row";

function MessagesInboxSkeleton() {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3.5 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}

function MessagesInboxEmpty() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <p className="text-center text-muted-foreground">No conversations yet.</p>
    </div>
  );
}

export function MessagesInbox() {
  const { conversations, isLoading, canLoadMore, loadMore } =
    useViewerConversations();

  if (isLoading) {
    return <MessagesInboxSkeleton />;
  }

  if (conversations.length === 0) {
    return <MessagesInboxEmpty />;
  }

  return (
    <div className="flex flex-col">
      {conversations.map((row) => (
        <MessagesInboxRow key={row.conversationId} row={row} />
      ))}

      {canLoadMore && (
        <div className="flex justify-center py-4">
          <Button variant="ghost" onClick={loadMore}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
