import { defineTable } from "convex/server";
import { contentBaseFields } from "../content/schema";

export const postsTable = defineTable(contentBaseFields)
  .index("by_userId", ["userId"])
  .index("by_userId_and_slug", ["userId", "slug"]);
