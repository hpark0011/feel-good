"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { SortOrder } from "../hooks/use-article-sort";
import type { UseArticleSearchReturn } from "../hooks/use-article-search";
import type { UseArticleFilterReturn } from "../hooks/use-article-filter";
import type { Article } from "../lib/mock-articles";
import { useArticleList } from "../hooks/use-article-list";
import { useArticleSearch } from "../hooks/use-article-search";
import { useArticleSelection } from "../hooks/use-article-selection";
import { useArticleSort } from "../hooks/use-article-sort";
import { useArticleFilter } from "../hooks/use-article-filter";
import { filterArticles, getUniqueCategories } from "../utils/article-filter";
import { useIsProfileOwner } from "@/features/profile";

type ArticleWorkspaceContextValue = {
  // Toolbar state
  isOwner: boolean;
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
  search: UseArticleSearchReturn;
  filter: UseArticleFilterReturn;
  categories: { name: string; count: number }[];
  selectedCount: number;
  onDelete: () => void;

  // List state
  articles: Article[];
  hasMore: boolean;
  onLoadMore: () => void;
  username: string;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  onToggleAll: () => void;
  isSelected: (slug: string) => boolean;
  onToggle: (slug: string) => void;
  shouldAnimate: boolean;

  // Empty state
  hasNoArticles: boolean;
  showEmpty: boolean;
  emptyMessage: string;
};

const ArticleWorkspaceContext =
  createContext<ArticleWorkspaceContextValue | null>(null);

type ArticleWorkspaceProviderProps = {
  articles: Article[];
  username: string;
  children: ReactNode;
};

export function ArticleWorkspaceProvider({
  articles: initialArticles,
  username,
  children,
}: ArticleWorkspaceProviderProps) {
  const [articles, setArticles] = useState(initialArticles);
  const isOwner = useIsProfileOwner();
  const search = useArticleSearch(articles);
  const { sortOrder, setSortOrder } = useArticleSort();
  const filter = useArticleFilter();
  const filteredByFilter = useMemo(
    () => filterArticles(search.filteredArticles, filter.filterState, isOwner),
    [search.filteredArticles, filter.filterState, isOwner],
  );
  const { articles: paginatedArticles, hasMore, loadMore } = useArticleList(
    filteredByFilter,
    sortOrder,
    search.isFiltered,
  );

  // Animation trigger on sort change
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    };
  }, []);

  const allSlugs = useMemo(
    () => paginatedArticles.map((a) => a.slug),
    [paginatedArticles],
  );

  const selection = useArticleSelection(allSlugs);

  const uniqueCategories = useMemo(
    () => getUniqueCategories(articles),
    [articles],
  );

  // Clear selection when search opens or filter changes
  const prevSearchOpen = useRef(search.isOpen);
  const prevFilterState = useRef(filter.filterState);
  useEffect(() => {
    if (search.isOpen && !prevSearchOpen.current) {
      selection.clear();
    }
    prevSearchOpen.current = search.isOpen;

    if (prevFilterState.current !== filter.filterState) {
      selection.clear();
    }
    prevFilterState.current = filter.filterState;
  }, [search.isOpen, filter.filterState, selection]);

  const handleSortChange = useCallback(
    (order: SortOrder) => {
      setSortOrder(order);
      selection.clear();
      setShouldAnimate(true);
      if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
      animationTimerRef.current = setTimeout(
        () => setShouldAnimate(false),
        1000,
      );
    },
    [setSortOrder, selection],
  );

  const handleDelete = useCallback(() => {
    const visibleSlugs = new Set(allSlugs);
    setArticles((prev) =>
      prev.filter(
        (a) =>
          !(selection.selectedSlugs.has(a.slug) && visibleSlugs.has(a.slug)),
      ),
    );
    selection.clear();
  }, [selection, allSlugs]);

  // Empty state derivations
  const hasNoArticles = articles.length === 0;

  const showEmpty =
    paginatedArticles.length === 0 &&
    (search.query.trim() !== "" || filter.hasActiveFilters);

  const emptyMessage =
    search.query.trim() !== "" && filter.hasActiveFilters
      ? "No articles match your search and filters"
      : filter.hasActiveFilters
        ? "No articles match the current filters"
        : "No articles found";

  const value = useMemo<ArticleWorkspaceContextValue>(
    () => ({
      // Toolbar state
      isOwner,
      sortOrder,
      onSortChange: handleSortChange,
      search,
      filter,
      categories: uniqueCategories,
      selectedCount: selection.selectedSlugs.size,
      onDelete: handleDelete,

      // List state
      articles: paginatedArticles,
      hasMore,
      onLoadMore: loadMore,
      username,
      isAllSelected: selection.isAllSelected,
      isIndeterminate: selection.isIndeterminate,
      onToggleAll: selection.toggleAll,
      isSelected: selection.isSelected,
      onToggle: selection.toggle,
      shouldAnimate,

      // Empty state
      hasNoArticles,
      showEmpty,
      emptyMessage,
    }),
    [
      isOwner,
      sortOrder,
      handleSortChange,
      search,
      filter,
      uniqueCategories,
      selection.selectedSlugs.size,
      selection.isAllSelected,
      selection.isIndeterminate,
      selection.toggleAll,
      selection.isSelected,
      selection.toggle,
      handleDelete,
      paginatedArticles,
      hasMore,
      loadMore,
      username,
      shouldAnimate,
      hasNoArticles,
      showEmpty,
      emptyMessage,
    ],
  );

  return (
    <ArticleWorkspaceContext.Provider value={value}>
      {children}
    </ArticleWorkspaceContext.Provider>
  );
}

export function useArticleWorkspace() {
  const context = useContext(ArticleWorkspaceContext);
  if (!context) {
    throw new Error(
      "useArticleWorkspace must be used within ArticleWorkspaceProvider",
    );
  }
  return context;
}
