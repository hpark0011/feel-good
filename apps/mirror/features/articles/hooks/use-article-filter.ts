"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import type { DatePreset } from "../utils/date-preset";
import {
  type ArticleFilterState,
  INITIAL_FILTER_STATE,
} from "../utils/article-filter";

type UseArticleFilterReturn = {
  filterState: ArticleFilterState;
  toggleCategory: (name: string) => void;
  setPublishedDatePreset: (preset: DatePreset | null) => void;
  setCreatedDatePreset: (preset: DatePreset | null) => void;
  setPublishedStatus: (status: "draft" | "published" | null) => void;
  clearAll: () => void;
  hasActiveFilters: boolean;
};

export function useArticleFilter(): UseArticleFilterReturn {
  const [filterState, setFilterState] = useLocalStorage(
    "mirror.articles.filter",
    INITIAL_FILTER_STATE
  );

  const toggleCategory = useCallback(
    (name: string) => {
      setFilterState((prev) => ({
        ...prev,
        categories: prev.categories.includes(name)
          ? prev.categories.filter((c) => c !== name)
          : [...prev.categories, name],
      }));
    },
    [setFilterState]
  );

  const setPublishedDatePreset = useCallback(
    (preset: DatePreset | null) => {
      setFilterState((prev) => ({
        ...prev,
        publishedDatePreset: preset,
      }));
    },
    [setFilterState]
  );

  const setCreatedDatePreset = useCallback(
    (preset: DatePreset | null) => {
      setFilterState((prev) => ({
        ...prev,
        createdDatePreset: preset,
      }));
    },
    [setFilterState]
  );

  const setPublishedStatus = useCallback(
    (status: "draft" | "published" | null) => {
      setFilterState((prev) => ({
        ...prev,
        publishedStatus: status,
      }));
    },
    [setFilterState]
  );

  const clearAll = useCallback(() => {
    setFilterState(INITIAL_FILTER_STATE);
  }, [setFilterState]);

  const hasActiveFilters = useMemo(() => {
    return (
      filterState.categories.length > 0 ||
      filterState.publishedDatePreset !== null ||
      filterState.createdDatePreset !== null ||
      filterState.publishedStatus !== null
    );
  }, [filterState]);

  return {
    filterState,
    toggleCategory,
    setPublishedDatePreset,
    setCreatedDatePreset,
    setPublishedStatus,
    clearAll,
    hasActiveFilters,
  };
}
