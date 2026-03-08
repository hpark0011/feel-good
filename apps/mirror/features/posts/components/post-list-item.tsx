"use client";

import Link from "next/link";
import { ContentBody } from "@feel-good/features/editor/components";
import { useChatSearchParams } from "@/hooks/use-chat-search-params";
import { formatLongDate, getContentHref } from "@/features/content";
import type { PostSummary } from "../types";

type PostListItemProps = {
  post: PostSummary;
  username: string;
};

export function PostListItem({ post, username }: PostListItemProps) {
  const { buildChatAwareHref } = useChatSearchParams();
  const href = buildChatAwareHref(getContentHref(username, "posts", post.slug));
  const publishedLabel = post.status === "draft"
    ? "Draft"
    : formatLongDate(post.publishedAt ?? post.createdAt);

  return (
    <article className="border-b border-border-subtle last:border-b-0">
      <Link
        href={href}
        scroll={false}
        className="block px-4.5 py-8 transition-colors hover:text-blue-11"
      >
        <div className="flex items-start justify-between gap-20 w-full">
          <span className="shrink-0 text-[13px] font-medium w-24 whitespace-nowrap tracking-[-0.06em] leading-1.4 pt-[2px] uppercase">
            {publishedLabel}
          </span>
          <div className="min-w-0 space-y-3 w-lg">
            <h2 className="text-xl leading-tight underline">
              {post.title}
            </h2>
            <span className="block text-[15px] font-medium text-muted-foreground leading-[1.2]">
              {post.category}
            </span>
            <ContentBody
              content={post.body}
              className="max-w-xl text-[17px] leading-[1.3] font-regular space-y-2 [&_img]:my-3"
            />
          </div>
        </div>
      </Link>
    </article>
  );
}
