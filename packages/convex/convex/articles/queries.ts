import { query } from "../_generated/server";
import type { QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import { authComponent } from "../auth/client";
import {
  articleSummaryReturnValidator,
  articleWithBodyReturnValidator,
  conversationArticleReturnValidator,
  resolveCoverImageUrl,
} from "./helpers";

async function getUserAndArticleAccess(ctx: QueryCtx, username: string) {
  const user = await ctx.db
    .query("users")
    .withIndex("by_username", (q) => q.eq("username", username))
    .unique();
  if (!user) {
    return null;
  }

  const authUser = await authComponent.safeGetAuthUser(ctx);
  const isOwner = !!authUser && user.authId === authUser._id;

  return { user, isOwner };
}

function filterVisibleArticles(articles: Doc<"articles">[], isOwner: boolean) {
  return articles.filter((article) => isOwner || article.status !== "draft");
}

export const getByUsername = query({
  args: { username: v.string() },
  returns: v.union(v.array(articleSummaryReturnValidator), v.null()),
  handler: async (ctx, args) => {
    const access = await getUserAndArticleAccess(ctx, args.username);
    if (!access) {
      return null;
    }

    const { user, isOwner } = access;

    const articles = await ctx.db
      .query("articles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const visible = filterVisibleArticles(articles, isOwner);

    const coverImageUrls = await Promise.all(
      visible.map((a) => resolveCoverImageUrl(ctx, a.coverImageStorageId)),
    );

    return visible.map((article, i) => ({
      _id: article._id,
      _creationTime: article._creationTime,
      userId: article.userId,
      slug: article.slug,
      title: article.title,
      coverImageUrl: coverImageUrls[i]!,
      createdAt: article.createdAt,
      publishedAt: article.publishedAt,
      status: article.status,
      category: article.category,
    }));
  },
});

export const getByUsernameForConversation = query({
  args: { username: v.string() },
  returns: v.union(v.array(conversationArticleReturnValidator), v.null()),
  handler: async (ctx, args) => {
    const access = await getUserAndArticleAccess(ctx, args.username);
    if (!access) {
      return null;
    }

    const { user, isOwner } = access;
    const articles = await ctx.db
      .query("articles")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    return filterVisibleArticles(articles, isOwner).map((article) => ({
      title: article.title,
      body: article.body,
    }));
  },
});

export const getBySlug = query({
  args: { username: v.string(), slug: v.string() },
  returns: v.union(articleWithBodyReturnValidator, v.null()),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();
    if (!user) {
      return null;
    }

    const article = await ctx.db
      .query("articles")
      .withIndex("by_userId_and_slug", (q) =>
        q.eq("userId", user._id).eq("slug", args.slug),
      )
      .unique();
    if (!article) {
      return null;
    }

    if (article.status === "draft") {
      const authUser = await authComponent.safeGetAuthUser(ctx);
      const isOwner = !!authUser && user.authId === authUser._id;
      if (!isOwner) {
        return null;
      }
    }

    const coverImageUrl = await resolveCoverImageUrl(
      ctx,
      article.coverImageStorageId,
    );

    return {
      _id: article._id,
      _creationTime: article._creationTime,
      userId: article.userId,
      slug: article.slug,
      title: article.title,
      coverImageUrl,
      createdAt: article.createdAt,
      publishedAt: article.publishedAt,
      status: article.status,
      category: article.category,
      body: article.body,
    };
  },
});
