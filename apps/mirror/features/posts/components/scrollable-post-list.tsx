"use client";

import { HeptagonalPrism } from "@/components/animated-geometries/heptagonal-prism";
import { usePostWorkspace } from "../context/post-workspace-context";
import { PostListItem } from "./post-list-item";

function EmptyMessage() {
  return (
    <div className="flex flex-col items-center justify-center pb-16 text-muted-foreground gap-4 h-full">
      <HeptagonalPrism />
    </div>
  );
}

export function ScrollablePostList() {
  const { posts, username, hasNoPosts } = usePostWorkspace();

  if (hasNoPosts) {
    return <EmptyMessage />;
  }

  return (
    <section className="w-full">
      {posts.map((post) => (
        <PostListItem key={post.slug} post={post} username={username} />
      ))}
    </section>
  );
}
