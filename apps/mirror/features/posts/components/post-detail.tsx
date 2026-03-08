"use client";

import dynamic from "next/dynamic";
import { formatLongDate } from "@/features/content";
import type { PostWithBody } from "../types";

const RichTextViewer = dynamic(
  () =>
    import("@feel-good/features/editor/components").then(
      (m) => m.RichTextViewer,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="prose dark:prose-invert max-w-none min-h-[200px]" />
    ),
  },
);

type PostDetailProps = {
  post: PostWithBody;
};

export function PostDetail({ post }: PostDetailProps) {
  return (
    <div className="min-h-[calc(100vh-40px)] bg-background px-4 py-8">
      <article className="mx-auto max-w-2xl">
        <div className="mb-12 space-y-3">
          <div className="flex flex-col items-start gap-0.5">
            <span className="text-[15px] leading-[1.2] text-muted-foreground">
              {post.status === "draft"
                ? "Draft"
                : formatLongDate(post.publishedAt ?? post.createdAt)}
            </span>
            <span className="text-[15px] font-medium text-muted-foreground leading-[1.2]">
              {post.category}
            </span>
          </div>
          <h1 className="max-w-xl text-3xl font-medium leading-tight tracking-[-0.02em]">
            {post.title}
          </h1>
        </div>

        <div className="max-w-xl">
          <RichTextViewer content={post.body} />
        </div>
      </article>
    </div>
  );
}
