import { v } from "convex/values";
import type { Doc } from "../_generated/dataModel";
import { authMutation } from "../lib/auth";
import { getAppUser } from "../users/helpers";
import {
  generateSlug,
  isOwnedByUser,
  validateContentStringLength,
} from "../content/helpers";
import { MAX_SLUG_LENGTH, MAX_TITLE_LENGTH } from "../content/schema";

type PostPatch = Partial<
  Omit<Doc<"posts">, "_id" | "_creationTime" | "userId" | "createdAt">
>;

export const create = authMutation({
  args: {
    title: v.string(),
    slug: v.optional(v.string()),
    body: v.any(),
    status: v.union(v.literal("draft"), v.literal("published")),
  },
  returns: v.id("posts"),
  handler: async (ctx, args) => {
    const appUser = await getAppUser(ctx, ctx.user._id);

    validateContentStringLength(args.title, "Title", MAX_TITLE_LENGTH);

    const slug = args.slug || generateSlug(args.title);
    validateContentStringLength(slug, "Slug", MAX_SLUG_LENGTH);

    if (!slug) {
      throw new Error("Slug cannot be empty");
    }

    const existing = await ctx.db
      .query("posts")
      .withIndex("by_userId_and_slug", (q) =>
        q.eq("userId", appUser._id).eq("slug", slug),
      )
      .unique();
    if (existing) {
      throw new Error(`A post with slug "${slug}" already exists`);
    }

    const now = Date.now();
    return await ctx.db.insert("posts", {
      userId: appUser._id,
      slug,
      title: args.title,
      body: args.body,
      status: args.status,
      createdAt: now,
      publishedAt: args.status === "published" ? now : undefined,
    });
  },
});

export const update = authMutation({
  args: {
    id: v.id("posts"),
    title: v.optional(v.string()),
    slug: v.optional(v.string()),
    body: v.optional(v.any()),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const appUser = await getAppUser(ctx, ctx.user._id);
    const post = await ctx.db.get(args.id);
    if (!post) {
      throw new Error("Post not found");
    }
    if (!isOwnedByUser(post, appUser._id)) {
      throw new Error("Not authorized to update this post");
    }

    if (args.title !== undefined) {
      validateContentStringLength(args.title, "Title", MAX_TITLE_LENGTH);
    }
    if (args.slug !== undefined) {
      validateContentStringLength(args.slug, "Slug", MAX_SLUG_LENGTH);
    }

    if (args.slug && args.slug !== post.slug) {
      const existing = await ctx.db
        .query("posts")
        .withIndex("by_userId_and_slug", (q) =>
          q.eq("userId", appUser._id).eq("slug", args.slug!),
        )
        .unique();
      if (existing) {
        throw new Error(`A post with slug "${args.slug}" already exists`);
      }
    }

    const patch: PostPatch = {};
    if (args.title !== undefined) patch.title = args.title;
    if (args.slug !== undefined) patch.slug = args.slug;
    if (args.body !== undefined) patch.body = args.body;

    if (args.status !== undefined) {
      patch.status = args.status;
      if (args.status === "published" && !post.publishedAt) {
        patch.publishedAt = Date.now();
      }
    }

    await ctx.db.patch(args.id, patch);
    return null;
  },
});

export const remove = authMutation({
  args: { ids: v.array(v.id("posts")) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const appUser = await getAppUser(ctx, ctx.user._id);

    const uniqueIds = [...new Set(args.ids)];
    const posts = await Promise.all(uniqueIds.map((id) => ctx.db.get(id)));
    const owned = posts.filter(
      (post): post is Doc<"posts"> =>
        post !== null && isOwnedByUser(post, appUser._id),
    );

    for (const post of owned) {
      await ctx.db.delete(post._id);
    }

    return null;
  },
});
