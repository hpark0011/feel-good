"use client";

import { useState, useCallback, useMemo } from "react";
import type { Article } from "../lib/mock-articles";
import type { SortOrder } from "./use-article-sort";

const PAGE_SIZE = 30;

export function useArticleList(allArticles: Article[], sortOrder: SortOrder) {
  const [page, setPage] = useState(1);

  const sorted = useMemo(() => {
    return [...allArticles].sort((a, b) => {
      const diff =
        new Date(b.published_at).getTime() -
        new Date(a.published_at).getTime();
      return sortOrder === "newest" ? diff : -diff;
    });
  }, [allArticles, sortOrder]);

  const articles = sorted.slice(0, page * PAGE_SIZE);
  const hasMore = articles.length < sorted.length;

  const loadMore = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  return { articles, hasMore, loadMore };
}
