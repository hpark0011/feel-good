"use client";

import { HeptagonalPrism } from "@/components/animated-geometries/heptagonal-prism";
import { usePostWorkspace } from "../context/post-workspace-context";
import { PostListItem } from "./post-list-item";

function EmptyMessage({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
      <HeptagonalPrism />
      {message}
    </div>
  );
}

export function ScrollablePostList() {
  const { posts, username, hasNoPosts } = usePostWorkspace();

  if (hasNoPosts) {
    return <EmptyMessage message="No posts yet" />;
  }

  return (
    <section className="w-full">
      {posts.map((post) => (
        <PostListItem key={post.slug} post={post} username={username} />
      ))}
    </section>
  );
}
