"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { SortOrder } from "../hooks/use-article-sort";
import type { Article } from "../lib/mock-articles";
import { useArticleList } from "../hooks/use-article-list";
import { useArticleSearch } from "../hooks/use-article-search";
import { useArticleSelection } from "../hooks/use-article-selection";
import { useArticleSort } from "../hooks/use-article-sort";
import { useIsProfileOwner } from "@/features/profile";
import { ArticleListView } from "../views/article-list-view";
import { ArticleToolbar } from "./article-toolbar";
import { useScrollRoot } from "../context/scroll-root-context";

type ScrollableArticleListProps = {
  articles: Article[];
  username: string;
};

export function ScrollableArticleList({
  articles: initialArticles,
  username,
}: ScrollableArticleListProps) {
  const [articles, setArticles] = useState(initialArticles);
  const search = useArticleSearch(articles);
  const { sortOrder, setSortOrder } = useArticleSort();
  const { articles: paginatedArticles, hasMore, loadMore } = useArticleList(
    search.filteredArticles,
    sortOrder,
  );
  const isOwner = useIsProfileOwner();
  const scrollRoot = useScrollRoot();

  // Animation trigger on sort change — driven from event handler, not effect
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const animationTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

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

  // Clear selection when search opens
  const prevSearchOpen = useRef(search.isOpen);
  useEffect(() => {
    if (search.isOpen && !prevSearchOpen.current) {
      selection.clear();
    }
    prevSearchOpen.current = search.isOpen;
  }, [search.isOpen, selection]);

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
    setArticles((prev) =>
      prev.filter((a) => !selection.selectedSlugs.has(a.slug)),
    );
    selection.clear();
  }, [selection]);

  if (articles.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        No articles yet
      </div>
    );
  }

  const showEmptySearch =
    search.query.trim() !== "" && paginatedArticles.length === 0;

  return (
    <>
      <ArticleToolbar
        isOwner={isOwner}
        selectedCount={selection.count}
        onDelete={handleDelete}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        searchQuery={search.query}
        onSearchQueryChange={search.setQuery}
        isSearchOpen={search.isOpen}
        onSearchOpen={search.open}
        onSearchClose={search.close}
      />
      {showEmptySearch ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          No articles found
        </div>
      ) : (
        <ArticleListView
          articles={paginatedArticles}
          hasMore={hasMore}
          onLoadMore={loadMore}
          scrollRoot={scrollRoot}
          username={username}
          isOwner={isOwner}
          isAllSelected={selection.isAllSelected}
          isIndeterminate={selection.isIndeterminate}
          onToggleAll={selection.toggleAll}
          isSelected={selection.isSelected}
          onToggle={selection.toggle}
          shouldAnimate={shouldAnimate}
        />
      )}
    </>
  );
}
