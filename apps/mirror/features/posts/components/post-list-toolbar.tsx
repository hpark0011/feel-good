"use client";

import { Icon } from "@feel-good/ui/components/icon";
import { Button } from "@feel-good/ui/primitives/button";
import { usePostWorkspace } from "../context/post-workspace-context";

export function PostListToolbar() {
  const { isOwner } = usePostWorkspace();

  return (
    <div className="flex h-14 items-center justify-end bg-background px-4.5">
      {isOwner && (
        <Button
          variant="primary"
          size="sm"
          className="has-[>svg]:gap-0.5 has-[>svg]:pl-1.5"
        >
          <Icon name="PlusIcon" className="size-4.5 text-icon-light" />
          New
        </Button>
      )}
    </div>
  );
}
