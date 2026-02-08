"use client";

import { useState, useCallback } from "react";
import type { Article } from "../_data/mock-articles";

const PAGE_SIZE = 10;

export function useArticleList(allArticles: Article[]) {
  const [page, setPage] = useState(1);

  const articles = allArticles.slice(0, page * PAGE_SIZE);
  const hasMore = articles.length < allArticles.length;

  const loadMore = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  return { articles, hasMore, loadMore };
}
