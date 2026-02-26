import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    authId: v.string(),
    email: v.string(),
    username: v.optional(v.string()),
    name: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarStorageId: v.optional(v.id("_storage")),
    onboardingComplete: v.boolean(),
  })
    .index("by_authId", ["authId"])
    .index("by_email", ["email"])
    .index("by_username", ["username"]),

  articles: defineTable({
    userId: v.id("users"),
    slug: v.string(),
    title: v.string(),
    coverImageStorageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
    publishedAt: v.optional(v.number()),
    status: v.union(v.literal("draft"), v.literal("published")),
    category: v.string(),
    body: v.any(),
  })
    .index("by_userId", ["userId"])
    .index("by_userId_and_slug", ["userId", "slug"]),
});
