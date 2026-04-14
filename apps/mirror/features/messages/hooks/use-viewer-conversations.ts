"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "@feel-good/convex/convex/_generated/api";

const INITIAL_NUM_ITEMS = 20;

export function useViewerConversations() {
  const { results, status, loadMore } = usePaginatedQuery(
    api.chat.queries.getViewerConversations,
    {},
    { initialNumItems: INITIAL_NUM_ITEMS },
  );

  return {
    conversations: results,
    isLoading: status === "LoadingFirstPage",
    canLoadMore: status === "CanLoadMore",
    loadMore: () => loadMore(INITIAL_NUM_ITEMS),
  };
}
