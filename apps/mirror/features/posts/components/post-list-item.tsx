"use client";

import Link from "next/link";
import { getPlainText } from "@feel-good/features/editor";
import { useChatSearchParams } from "@/hooks/use-chat-search-params";
import {
  formatShortDate,
  getContentHref,
} from "@/features/content";
import type { PostSummary } from "../types";

type PostListItemProps = {
  post: PostSummary;
  username: string;
};

function getPostPreview(post: PostSummary) {
  const preview = getPlainText(post.body).replace(/\s+/g, " ").trim();
  if (preview.length <= 220) {
    return preview;
  }
  return `${preview.slice(0, 217).trimEnd()}...`;
}

export function PostListItem({ post, username }: PostListItemProps) {
  const { buildChatAwareHref } = useChatSearchParams();
  const href = buildChatAwareHref(getContentHref(username, "posts", post.slug));
  const publishedLabel = post.status === "draft"
    ? "Draft"
    : formatShortDate(post.publishedAt ?? post.createdAt);

  return (
    <article className="border-b border-border-subtle last:border-b-0">
      <Link
        href={href}
        scroll={false}
        className="block px-4.5 py-5 transition-colors hover:bg-muted/40"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <h2 className="text-lg font-medium leading-tight text-foreground">
              {post.title}
            </h2>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground">
              {getPostPreview(post)}
            </p>
          </div>
          <span className="shrink-0 pt-0.5 text-xs font-medium text-muted-foreground">
            {publishedLabel}
          </span>
        </div>
      </Link>
    </article>
  );
}
