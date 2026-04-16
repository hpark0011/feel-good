import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

/**
 * Insert an allowlist entry. Lowercases the email on write. Idempotent:
 * if a row for the (lowercased) email already exists, this is a no-op.
 */
export const addAllowlistEntry = internalMutation({
  args: {
    email: v.string(),
    note: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const normalized = args.email.toLowerCase();
    const existing = await ctx.db
      .query("betaAllowlist")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .unique();
    if (existing !== null) {
      return null;
    }
    await ctx.db.insert("betaAllowlist", {
      email: normalized,
      note: args.note,
      addedAt: Date.now(),
    });
    return null;
  },
});

/**
 * Remove an allowlist entry. Case-insensitive lookup via the `by_email`
 * index. No-op if no row matches.
 */
export const removeAllowlistEntry = internalMutation({
  args: { email: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const normalized = args.email.toLowerCase();
    const existing = await ctx.db
      .query("betaAllowlist")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .unique();
    if (existing === null) {
      return null;
    }
    await ctx.db.delete(existing._id);
    return null;
  },
});
