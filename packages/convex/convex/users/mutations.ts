import { v } from "convex/values";
import { authMutation } from "../lib/auth";
import { RESERVED_USERNAMES, getAppUser } from "./helpers";

export const updatePersonaSettings = authMutation({
  args: {
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
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Length guards — checked BEFORE any DB write
    if (
      typeof args.personaPrompt === "string" &&
      args.personaPrompt.length > 4000
    ) {
      throw new Error("personaPrompt exceeds 4000 characters");
    }
    if (
      typeof args.topicsToAvoid === "string" &&
      args.topicsToAvoid.length > 500
    ) {
      throw new Error("topicsToAvoid exceeds 500 characters");
    }

    const appUser = await getAppUser(ctx, ctx.user._id);

    // Build patch conditionally: undefined = leave unchanged, null = clear
    const patch: Record<string, unknown> = {};
    if (args.personaPrompt !== undefined) patch.personaPrompt = args.personaPrompt;
    if (args.tonePreset !== undefined) patch.tonePreset = args.tonePreset;
    if (args.topicsToAvoid !== undefined) patch.topicsToAvoid = args.topicsToAvoid;

    await ctx.db.patch("users", appUser._id, patch);
    return null;
  },
});

export const setUsername = authMutation({
  args: { username: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const appUser = await getAppUser(ctx, ctx.user._id);

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

    await ctx.db.patch("users", appUser._id, { username: args.username });
    return null;
  },
});

export const updateProfile = authMutation({
  args: {
    bio: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const appUser = await getAppUser(ctx, ctx.user._id);

    await ctx.db.patch("users", appUser._id, {
      ...(args.bio !== undefined ? { bio: args.bio } : {}),
      ...(args.name !== undefined ? { name: args.name } : {}),
    });
    return null;
  },
});

export const setAvatar = authMutation({
  args: { storageId: v.id("_storage") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const appUser = await getAppUser(ctx, ctx.user._id);

    if (appUser.avatarStorageId) {
      await ctx.storage.delete(appUser.avatarStorageId);
    }

    await ctx.db.patch("users", appUser._id, { avatarStorageId: args.storageId });
    return null;
  },
});

export const completeOnboarding = authMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const appUser = await getAppUser(ctx, ctx.user._id);

    if (!appUser.username) {
      throw new Error("Username must be set before completing onboarding");
    }

    await ctx.db.patch("users", appUser._id, { onboardingComplete: true });
    return null;
  },
});

export const generateAvatarUploadUrl = authMutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Ensure an app user record exists for the current auth user.
 * Backfills users created before the onCreate trigger was added.
 */
export const ensureProfile = authMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", ctx.user._id))
      .unique();

    if (!existing) {
      console.info(
        `[auth] Backfilling app profile for pre-existing auth user. authId=${ctx.user._id} email=${ctx.user.email}`
      );
      await ctx.db.insert("users", {
        authId: ctx.user._id,
        email: ctx.user.email,
        onboardingComplete: false,
      });
    }

    return null;
  },
});
