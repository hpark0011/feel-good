import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { authComponent } from "../auth/client";
import { RESERVED_USERNAMES, getAppUser } from "./helpers";

export const setUsername = mutation({
  args: { username: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const appUser = await getAppUser(ctx, authUser._id);

    const usernameRegex = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;
    if (!usernameRegex.test(args.username)) {
      throw new Error(
        "Invalid username format. Must be 3-30 characters, lowercase alphanumeric and hyphens, no leading/trailing hyphens.",
      );
    }

    if (RESERVED_USERNAMES.has(args.username)) {
      throw new Error("This username is reserved and cannot be used");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    if (existing !== null && existing._id !== appUser._id) {
      throw new Error("Username is already taken");
    }

    await ctx.db.patch(appUser._id, { username: args.username });
    return null;
  },
});

export const updateProfile = mutation({
  args: {
    bio: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const appUser = await getAppUser(ctx, authUser._id);

    await ctx.db.patch(appUser._id, {
      ...(args.bio !== undefined ? { bio: args.bio } : {}),
      ...(args.name !== undefined ? { name: args.name } : {}),
    });
    return null;
  },
});

export const setAvatar = mutation({
  args: { storageId: v.id("_storage") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const appUser = await getAppUser(ctx, authUser._id);

    if (appUser.avatarStorageId) {
      await ctx.storage.delete(appUser.avatarStorageId);
    }

    await ctx.db.patch(appUser._id, { avatarStorageId: args.storageId });
    return null;
  },
});

export const completeOnboarding = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const appUser = await getAppUser(ctx, authUser._id);

    if (!appUser.username) {
      throw new Error("Username must be set before completing onboarding");
    }

    await ctx.db.patch(appUser._id, { onboardingComplete: true });
    return null;
  },
});

export const generateAvatarUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Ensure an app user record exists for the current auth user.
 * Backfills users created before the onCreate trigger was added.
 */
export const ensureProfile = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Not authenticated");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", authUser._id))
      .unique();

    if (!existing) {
      console.info(
        `[auth] Backfilling app profile for pre-existing auth user. authId=${authUser._id} email=${authUser.email}`
      );
      await ctx.db.insert("users", {
        authId: authUser._id,
        email: authUser.email,
        onboardingComplete: false,
      });
    }

    return null;
  },
});
