"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import type { Article } from "../lib/mock-articles";

type UseArticleSearchReturn = {
  filteredArticles: Article[];
  query: string;
  setQuery: (q: string) => void;
  isOpen: boolean;
  isFiltered: boolean;
  open: () => void;
  close: () => void;
};

export function useArticleSearch(
  articles: Article[],
): UseArticleSearchReturn {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // 300ms debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Filter + sort by match priority (title > body > category)
  const filteredArticles = useMemo(() => {
    if (!debouncedQuery.trim()) return articles;

    const q = debouncedQuery.toLowerCase();

    return articles
      .filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.body.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        const score = (article: Article) => {
          if (article.title.toLowerCase().includes(q)) return 0;
          if (article.body.toLowerCase().includes(q)) return 1;
          return 2;
        };
        return score(a) - score(b);
      });
  }, [articles, debouncedQuery]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setDebouncedQuery("");
  }, []);

  const isFiltered = debouncedQuery.trim() !== "";

  return { filteredArticles, query, setQuery, isOpen, isFiltered, open, close };
}
