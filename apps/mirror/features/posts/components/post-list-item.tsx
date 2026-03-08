"use client";

import Link from "next/link";
import { getPlainText } from "@feel-good/features/editor";
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
            <p className="max-w-xl text-[17px] leading-[1.3] font-regular">
              {getPlainText(post.body)}
            </p>
          </div>
        </div>
      </Link>
    </article>
  );
}
