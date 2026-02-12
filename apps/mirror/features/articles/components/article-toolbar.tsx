"use client";

import { useState } from "react";
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
import { cn } from "@feel-good/utils/cn";
import { DeleteArticlesDialog } from "../views/delete-articles-dialog";
import { ArticleSortDropdown } from "./article-sort-dropdown";
import { ArticleSearchInput } from "./article-search-input";
import { ArticleFilterDropdown } from "./article-filter-dropdown";
import type { SortOrder } from "../hooks/use-article-sort";
import type { ArticleFilterState } from "../utils/article-filter";
import type { DatePreset } from "../utils/date-preset";
import type { Article } from "../lib/mock-articles";

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
  articles: Article[];
  filterState: ArticleFilterState;
  hasActiveFilters: boolean;
  onToggleCategory: (name: string) => void;
  onSetPublishedDatePreset: (preset: DatePreset | null) => void;
  onSetCreatedDatePreset: (preset: DatePreset | null) => void;
  onSetPublishedStatus: (status: "draft" | "published" | null) => void;
  onClearAll: () => void;
  onClearCategories: () => void;
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
  articles,
  filterState,
  hasActiveFilters,
  onToggleCategory,
  onSetPublishedDatePreset,
  onSetCreatedDatePreset,
  onSetPublishedStatus,
  onClearAll,
  onClearCategories,
}: ArticleToolbarProps) {
  const hasSelection = selectedCount > 0;
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  return (
    <div className="flex items-center gap-2 px-2 justify-end mb-3 mt-2 pr-[2px]">
      <div
        className={cn(
          "flex items-center justify-end w-full gap-3",
        )}
      >
        {isOwner && (
          <div className="flex items-center">
            {hasSelection && (
              <span className="text-sm text-muted-foreground">
                {selectedCount} selected
              </span>
            )}
          </div>
        )}

        <div className="flex items-center">
          {/* Delete */}
          <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
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
                    className={cn(isDeleteOpen && "[&_svg]:text-information")}
                  >
                    <Icon name="TrashFillIcon" />
                  </Button>
                </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </AlertDialog>

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
          <ArticleFilterDropdown
            isOwner={isOwner}
            articles={articles}
            filterState={filterState}
            hasActiveFilters={hasActiveFilters}
            onToggleCategory={onToggleCategory}
            onSetPublishedDatePreset={onSetPublishedDatePreset}
            onSetCreatedDatePreset={onSetCreatedDatePreset}
            onSetPublishedStatus={onSetPublishedStatus}
            onClearAll={onClearAll}
            onClearCategories={onClearCategories}
          />

          {isOwner && (
            <Button
              variant="primary"
              size="sm"
              className="has-[>svg]:gap-0.5 has-[>svg]:pl-1.5 ml-2"
            >
              <Icon name="PlusIcon" className="text-icon-light size-4.5" />
              New
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
