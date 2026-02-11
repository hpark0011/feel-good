"use client";

import {
  AlertDialog,
  AlertDialogTrigger,
} from "@feel-good/ui/primitives/alert-dialog";
import { Button } from "@feel-good/ui/primitives/button";
import { Icon } from "@feel-good/ui/components/icon";
import { Tooltip, TooltipContent, TooltipTrigger } from "@feel-good/ui/primitives/tooltip";
import { DeleteArticlesDialog } from "../views/delete-articles-dialog";

type ArticleToolbarProps = {
  selectedCount: number;
  onDelete: () => void;
};

export function ArticleToolbar(
  { selectedCount, onDelete }: ArticleToolbarProps,
) {
  const hasSelection = selectedCount > 0;

  return (
    <div className="flex items-center gap-2 px-px justify-end mb-3 mt-2 pr-[2px]">
      <div className="flex items-center gap-0">
        <div className="flex items-center gap-2">
          {hasSelection && (
            <span className="text-sm text-muted-foreground">
              {selectedCount} selected
            </span>
          )}

          <AlertDialog>
            <DeleteArticlesDialog count={selectedCount} onConfirm={onDelete} />
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={!hasSelection}
                    aria-label={hasSelection
                      ? `Delete ${selectedCount} selected`
                      : "Delete"}
                  >
                    <Icon name="TrashFillIcon" />
                  </Button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </AlertDialog>
        </div>

        {/* Search */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
            >
              <Icon name="MagnifyingGlassIcon" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Search</TooltipContent>
        </Tooltip>

        {/* Sort */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
            >
              <Icon name="ArrowUpAndDownIcon" className="size-4.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Sort</TooltipContent>
        </Tooltip>

        {/* Filter */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
            >
              <Icon name="Line3Icon" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Filter</TooltipContent>
        </Tooltip>
      </div>
      <Button
        variant="primary"
        size="sm"
        className="has-[>svg]:gap-0.5 has-[>svg]:pl-1.5"
      >
        <Icon name="PlusIcon" className="text-icon-light size-4.5" />
        New
      </Button>
    </div>
  );
}
