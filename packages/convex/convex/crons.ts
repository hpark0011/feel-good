import { cronJobs } from "convex/server";
import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

const STALE_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes

export const clearStaleStreamingLocks = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const cutoff = Date.now() - STALE_THRESHOLD_MS;

    const conversations = await ctx.db.query("conversations").collect();
    for (const conversation of conversations) {
      if (
        conversation.streamingInProgress &&
        conversation.streamingStartedAt &&
        conversation.streamingStartedAt < cutoff
      ) {
        await ctx.db.patch(conversation._id, {
          streamingInProgress: false,
          streamingStartedAt: undefined,
        });
      }
    }

    return null;
  },
});

const crons = cronJobs();

crons.interval(
  "clear stale streaming locks",
  { minutes: 5 },
  internal.crons.clearStaleStreamingLocks,
  {},
);

export default crons;
