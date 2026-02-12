"use client";

import {
  AlertDialog,
  AlertDialogTrigger,
} from "@feel-good/ui/primitives/alert-dialog";
import { Button } from "@feel-good/ui/primitives/button";
import { Icon } from "@feel-good/ui/components/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@feel-good/ui/primitives/tooltip";
import { DeleteArticlesDialog } from "../views/delete-articles-dialog";
import { ArticleSortDropdown } from "./article-sort-dropdown";
import { ArticleSearchInput } from "./article-search-input";
import type { SortOrder } from "../hooks/use-article-sort";

type ArticleToolbarProps = {
  isOwner: boolean;
  selectedCount: number;
  onDelete: () => void;
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  isSearchOpen: boolean;
  onSearchOpen: () => void;
  onSearchClose: () => void;
};

export function ArticleToolbar({
  isOwner,
  selectedCount,
  onDelete,
  sortOrder,
  onSortChange,
  searchQuery,
  onSearchQueryChange,
  isSearchOpen,
  onSearchOpen,
  onSearchClose,
}: ArticleToolbarProps) {
  const hasSelection = selectedCount > 0;

  return (
    <div className="flex items-center gap-2 px-px justify-end mb-3 mt-2 pr-[2px]">
      <div className="flex items-center gap-0">
        {isOwner && (
          <div className="flex items-center gap-2">
            {hasSelection && (
              <span className="text-sm text-information">
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
        )}

        {/* Search */}
        <ArticleSearchInput
          query={searchQuery}
          onQueryChange={onSearchQueryChange}
          isOpen={isSearchOpen}
          onOpen={onSearchOpen}
          onClose={onSearchClose}
        />

        {/* Sort */}
        <ArticleSortDropdown value={sortOrder} onChange={onSortChange} />

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
      {isOwner && (
        <Button
          variant="primary"
          size="sm"
          className="has-[>svg]:gap-0.5 has-[>svg]:pl-1.5"
        >
          <Icon name="PlusIcon" className="text-icon-light size-4.5" />
          New
        </Button>
      )}
    </div>
  );
}
