"use client";

import { AlertDialog, AlertDialogTrigger } from "@feel-good/ui/primitives/alert-dialog";
import { Button } from "@feel-good/ui/primitives/button";
import { Icon } from "@feel-good/ui/components/icon";
import { DeleteArticlesDialog } from "../views/delete-articles-dialog";

type ArticleToolbarProps = {
  selectedCount: number;
  onDelete: () => void;
};

export function ArticleToolbar({ selectedCount, onDelete }: ArticleToolbarProps) {
  const hasSelection = selectedCount > 0;

  return (
    <div className="flex items-center gap-2 h-8">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={!hasSelection}
            aria-label={hasSelection ? `Delete ${selectedCount} selected` : "Delete"}
          >
            <Icon name="TrashFillIcon" size="sm" />
          </Button>
        </AlertDialogTrigger>
        <DeleteArticlesDialog count={selectedCount} onConfirm={onDelete} />
      </AlertDialog>
      {hasSelection && (
        <span className="text-sm text-muted-foreground">
          {selectedCount} selected
        </span>
      )}
    </div>
  );
}
