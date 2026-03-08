"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { usePreloadedQuery } from "convex/react";
import type { Preloaded } from "convex/react";
import type { api } from "@feel-good/convex/convex/_generated/api";
import { useIsProfileOwner } from "@/features/profile";
import type { PostSummary } from "../types";

type PostWorkspaceContextValue = {
  posts: PostSummary[];
  username: string;
  isOwner: boolean;
  hasNoPosts: boolean;
};

const PostWorkspaceContext =
  createContext<PostWorkspaceContextValue | null>(null);

type PostWorkspaceProviderProps = {
  preloadedPosts: Preloaded<typeof api.posts.queries.getByUsername>;
  username: string;
  children: ReactNode;
};

export function PostWorkspaceProvider({
  preloadedPosts,
  username,
  children,
}: PostWorkspaceProviderProps) {
  const reactivePosts = usePreloadedQuery(preloadedPosts);
  const isOwner = useIsProfileOwner();
  const posts = useMemo(() => {
    const nextPosts = [...((reactivePosts ?? []) as PostSummary[])];
    nextPosts.sort(
      (a, b) =>
        (b.publishedAt ?? b.createdAt) - (a.publishedAt ?? a.createdAt),
    );
    return nextPosts;
  }, [reactivePosts]);

  const value = useMemo(
    () => ({
      posts,
      username,
      isOwner,
      hasNoPosts: posts.length === 0,
    }),
    [posts, username, isOwner],
  );

  return (
    <PostWorkspaceContext.Provider value={value}>
      {children}
    </PostWorkspaceContext.Provider>
  );
}

export function usePostWorkspace() {
  const context = useContext(PostWorkspaceContext);
  if (!context) {
    throw new Error(
      "usePostWorkspace must be used within PostWorkspaceProvider",
    );
  }
  return context;
}
