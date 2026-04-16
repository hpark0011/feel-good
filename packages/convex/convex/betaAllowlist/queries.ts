import { v } from "convex/values";
import { internalQuery } from "../_generated/server";

/**
 * Returns `true` iff a row exists in `betaAllowlist` whose `email` matches
 * the input case-insensitively. The handler lowercases the caller's email
 * before querying the `by_email` index — never trust the caller to lowercase.
 */
export const isEmailAllowed = internalQuery({
  args: { email: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const normalized = args.email.toLowerCase();
    const row = await ctx.db
      .query("betaAllowlist")
      .withIndex("by_email", (q) => q.eq("email", normalized))
      .unique();
    return row !== null;
  },
});
