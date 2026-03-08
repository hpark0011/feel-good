import { v } from "convex/values";
import { contentStatusValidator } from "../content/schema";

const postFields = {
  _id: v.id("posts"),
  _creationTime: v.number(),
  userId: v.id("users"),
  slug: v.string(),
  title: v.string(),
  body: v.any(),
  createdAt: v.number(),
  publishedAt: v.optional(v.number()),
  status: contentStatusValidator,
};

export const postSummaryReturnValidator = v.object(postFields);

export const postWithBodyReturnValidator = v.object(postFields);
