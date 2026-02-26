import { v } from "convex/values";
import { authMutation } from "../lib/auth";
import { getAppUser } from "../users/helpers";
import { generateSlug } from "./helpers";

export const create = authMutation({
  args: {
    title: v.string(),
    slug: v.optional(v.string()),
    category: v.string(),
    body: v.any(),
    status: v.union(v.literal("draft"), v.literal("published")),
    coverImageStorageId: v.optional(v.id("_storage")),
  },
  returns: v.id("articles"),
  handler: async (ctx, args) => {
    const appUser = await getAppUser(ctx, ctx.user._id);
    const slug = args.slug || generateSlug(args.title);

    const existing = await ctx.db
      .query("articles")
      .withIndex("by_userId_and_slug", (q) =>
        q.eq("userId", appUser._id).eq("slug", slug),
      )
      .unique();
    if (existing) {
      throw new Error(`An article with slug "${slug}" already exists`);
    }

    const now = Date.now();
    return await ctx.db.insert("articles", {
      userId: appUser._id,
      slug,
      title: args.title,
      category: args.category,
      body: args.body,
      status: args.status,
      coverImageStorageId: args.coverImageStorageId,
      createdAt: now,
      publishedAt: args.status === "published" ? now : undefined,
    });
  },
});

export const update = authMutation({
  args: {
    id: v.id("articles"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    category: v.optional(v.string()),
    body: v.optional(v.any()),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
    coverImageStorageId: v.optional(v.id("_storage")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const appUser = await getAppUser(ctx, ctx.user._id);
    const article = await ctx.db.get(args.id);
    if (!article) {
      throw new Error("Article not found");
    }
    if (article.userId !== appUser._id) {
      throw new Error("Not authorized to update this article");
    }

    if (args.slug && args.slug !== article.slug) {
      const existing = await ctx.db
        .query("articles")
        .withIndex("by_userId_and_slug", (q) =>
          q.eq("userId", appUser._id).eq("slug", args.slug!),
        )
        .unique();
      if (existing) {
        throw new Error(`An article with slug "${args.slug}" already exists`);
      }
    }

    const patch: Record<string, unknown> = {};
    if (args.title !== undefined) patch.title = args.title;
    if (args.slug !== undefined) patch.slug = args.slug;
    if (args.category !== undefined) patch.category = args.category;
    if (args.body !== undefined) patch.body = args.body;
    if (args.coverImageStorageId !== undefined)
      patch.coverImageStorageId = args.coverImageStorageId;

    if (args.status !== undefined) {
      patch.status = args.status;
      if (args.status === "published" && !article.publishedAt) {
        patch.publishedAt = Date.now();
      }
    }

    await ctx.db.patch(args.id, patch);
    return null;
  },
});

export const remove = authMutation({
  args: { ids: v.array(v.id("articles")) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const appUser = await getAppUser(ctx, ctx.user._id);

    for (const id of args.ids) {
      const article = await ctx.db.get(id);
      if (!article) continue;
      if (article.userId !== appUser._id) {
        throw new Error("Not authorized to delete this article");
      }
      if (article.coverImageStorageId) {
        await ctx.storage.delete(article.coverImageStorageId);
      }
      await ctx.db.delete(id);
    }

    return null;
  },
});

export const generateCoverImageUploadUrl = authMutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
