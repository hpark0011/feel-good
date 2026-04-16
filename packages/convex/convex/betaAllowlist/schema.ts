import { defineTable } from "convex/server";
import { v } from "convex/values";

export const betaAllowlistTable = defineTable({
  email: v.string(),
  note: v.optional(v.string()),
  addedAt: v.number(),
}).index("by_email", ["email"]);
