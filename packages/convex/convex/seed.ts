import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const seedRickRubin = internalMutation({
  args: {},
  returns: v.id("users"),
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", "rick-rubin"))
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("users", {
      authId: "seed_rick_rubin",
      email: "rick@example.com",
      username: "rick-rubin",
      name: "Rick Rubin",
      bio: "Rick Rubin has been a singular, transformative creative muse for artists across genres and generations — from the Beastie Boys to Johnny Cash, from Public Enemy to the Red Hot Chili Peppers, from Adele to Jay-Z.",
      onboardingComplete: true,
    });
  },
});
