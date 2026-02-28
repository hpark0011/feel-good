"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { cloneAgent } from "./agent";

export const streamResponse = internalAction({
  args: {
    conversationId: v.id("conversations"),
    profileOwnerId: v.id("users"),
    promptMessageId: v.string(),
    lockStartedAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, { conversationId, profileOwnerId, promptMessageId, lockStartedAt }) => {
    try {
      const { threadId, systemPrompt } = await ctx.runQuery(
        internal.chat.helpers.loadStreamingContext,
        { conversationId, profileOwnerId },
      );

      const { thread } = await cloneAgent.continueThread(ctx, { threadId });

      await thread.streamText(
        { promptMessageId, system: systemPrompt },
        { saveStreamDeltas: { throttleMs: 100 } },
      );
    } finally {
      await ctx.runMutation(
        internal.chat.mutations.clearStreamingLock,
        { conversationId, expectedStartedAt: lockStartedAt },
      );
    }

    return null;
  },
});
