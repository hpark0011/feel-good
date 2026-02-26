import { v } from "convex/values";
import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export const articleReturnValidator = v.object({
  _id: v.id("articles"),
  _creationTime: v.number(),
  userId: v.id("users"),
  slug: v.string(),
  title: v.string(),
  coverImageUrl: v.union(v.string(), v.null()),
  createdAt: v.number(),
  publishedAt: v.optional(v.number()),
  status: v.union(v.literal("draft"), v.literal("published")),
  category: v.string(),
  body: v.any(),
});

export async function resolveCoverImageUrl(
  ctx: QueryCtx | MutationCtx,
  coverImageStorageId: Id<"_storage"> | undefined,
): Promise<string | null> {
  if (!coverImageStorageId) {
    return null;
  }
  return await ctx.storage.getUrl(coverImageStorageId);
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
