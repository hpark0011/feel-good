import { defineSchema } from "convex/server";
import { articlesTable } from "./articles/schema";
import { conversationsTable } from "./chat/schema";
import { usersTable } from "./users/schema";

export default defineSchema({
  users: usersTable,
  articles: articlesTable,
  conversations: conversationsTable,
});
