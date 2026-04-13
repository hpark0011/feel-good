import { v } from "convex/values";
import type { QueryCtx, MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

export const RESERVED_USERNAMES = new Set([
  "api",
  "admin",
  "dashboard",
  "settings",
  "sign-in",
  "sign-up",
]);

export const profileReturnValidator = v.object({
  _id: v.id("users"),
  authId: v.string(),
  email: v.string(),
  username: v.optional(v.string()),
  name: v.optional(v.string()),
  bio: v.optional(v.string()),
  avatarUrl: v.union(v.string(), v.null()),
  onboardingComplete: v.boolean(),
});

/**
 * Return validator for getCurrentProfile — extends profileReturnValidator with
 * the three persona fields that are only readable by the authenticated owner.
 * The pre-existing profileReturnValidator is deliberately left untouched (NFR-05).
 */
export const currentProfileReturnValidator = v.object({
  _id: v.id("users"),
  authId: v.string(),
  email: v.string(),
  username: v.optional(v.string()),
  name: v.optional(v.string()),
  bio: v.optional(v.string()),
  avatarUrl: v.union(v.string(), v.null()),
  onboardingComplete: v.boolean(),
  personaPrompt: v.optional(v.union(v.string(), v.null())),
  tonePreset: v.optional(
    v.union(
      v.literal("professional"),
      v.literal("friendly"),
      v.literal("witty"),
      v.literal("empathetic"),
      v.literal("direct"),
      v.literal("curious"),
      v.null(),
    ),
  ),
  topicsToAvoid: v.optional(v.union(v.string(), v.null())),
});

export const publicProfileReturnValidator = v.object({
  _id: v.id("users"),
  authId: v.string(),
  username: v.optional(v.string()),
  name: v.optional(v.string()),
  bio: v.optional(v.string()),
  avatarUrl: v.union(v.string(), v.null()),
  onboardingComplete: v.boolean(),
  chatAuthRequired: v.optional(v.boolean()),
});

export async function getAppUser(
  ctx: QueryCtx | MutationCtx,
  authId: Id<"users"> | string,
) {
  const appUser = await ctx.db
    .query("users")
    .withIndex("by_authId", (q) => q.eq("authId", authId as string))
    .unique();
  if (!appUser) {
    throw new Error("App user not found");
  }
  return appUser;
}

export async function resolveAvatarUrl(
  ctx: QueryCtx | MutationCtx,
  avatarStorageId: Id<"_storage"> | undefined,
): Promise<string | null> {
  if (!avatarStorageId) {
    return null;
  }
  return await ctx.storage.getUrl(avatarStorageId);
}
