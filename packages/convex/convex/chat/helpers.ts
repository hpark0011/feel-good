import { v } from "convex/values";
import { listMessages } from "@convex-dev/agent";
import { internalQuery, internalMutation } from "../_generated/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { components } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

// ── Summary normalization helpers ────────────────────────────────────

function normalizeSummaryText(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, 140);
}

export function buildSortKey(lastActivityAt: number, conversationId: string): string {
  return `${lastActivityAt.toString().padStart(16, "0")}-${conversationId}`;
}

// ── Rebuild result types ──────────────────────────────────────────────

type RebuildResult =
  | { status: "ok" }
  | { status: "retryable"; reason: string };

// ── Canonical summary rebuild helper ─────────────────────────────────
// Safe to call from mutations, actions, backfill, and repair jobs.
// Reads the latest message from the conversation's thread history,
// derives summary fields, and patches the conversation record.

export async function rebuildConversationSummary(
  ctx: QueryCtx & MutationCtx,
  conversationId: Id<"conversations">,
): Promise<RebuildResult> {
  const conversation = await ctx.db.get(conversationId);
  if (!conversation) {
    return { status: "ok" }; // Nothing to update — conversation was deleted
  }

  const threadId = conversation.threadId;

  // Paginate through thread history to find the latest message
  let cursor: string | null = null;
  let latestText: string | null = null;
  let latestRole: "user" | "assistant" | null = null;
  let latestTimestamp: number | null = null;

  while (true) {
    const result = await listMessages(ctx, components.agent, {
      threadId,
      paginationOpts: { numItems: 100, cursor },
      excludeToolMessages: true,
    });

    for (const msg of result.page) {
      const role = msg.message?.role;
      if (role !== "user" && role !== "assistant") continue;

      const content = msg.message?.content;
      let text: string | null = null;

      if (typeof content === "string") {
        text = content;
      } else if (Array.isArray(content)) {
        const extracted = content
          .filter((p): p is { type: "text"; text: string } => p.type === "text")
          .map((p) => p.text)
          .join("");
        if (extracted) text = extracted;
      }

      if (text) {
        latestText = text;
        latestRole = role as "user" | "assistant";
        // _creationTime is the message timestamp; fall back to Date.now() if absent
        latestTimestamp = (msg as { _creationTime?: number })._creationTime ?? Date.now();
      }
    }

    if (result.isDone) break;
    cursor = result.continueCursor;
  }

  if (!latestText || !latestRole || latestTimestamp === null) {
    // No queryable messages yet — caller should retry later
    return { status: "retryable", reason: "no messages queryable yet" };
  }

  const lastActivityAt = latestTimestamp;
  const lastActivitySortKey = buildSortKey(lastActivityAt, conversationId);
  const lastMessagePreview = normalizeSummaryText(latestText);

  await ctx.db.patch(conversationId, {
    lastActivityAt,
    lastActivitySortKey,
    lastMessagePreview,
    lastMessageRole: latestRole,
  });

  return { status: "ok" };
}

// Exported internal mutation wrapper for actions/scheduler use
export const rebuildConversationSummaryMutation = internalMutation({
  args: {
    conversationId: v.id("conversations"),
    attempt: v.optional(v.number()),
  },
  returns: v.object({
    status: v.union(v.literal("ok"), v.literal("retryable")),
    reason: v.optional(v.string()),
  }),
  handler: async (ctx, { conversationId, attempt: _attempt }) => {
    const result = await rebuildConversationSummary(ctx, conversationId);
    return result.status === "ok"
      ? { status: "ok" as const }
      : { status: "retryable" as const, reason: result.reason };
  },
});

// ── Backfill ──────────────────────────────────────────────────────────
// One-time idempotent backfill: iterates all viewer-owned conversations
// and calls the rebuild helper. Safe to re-run.

export const backfillConversationSummaries = internalMutation({
  args: {},
  returns: v.object({ processed: v.number(), skipped: v.number() }),
  handler: async (ctx) => {
    // Collect all conversations that have a viewerId (viewer-owned)
    // We iterate via the by_viewerId index to stay index-backed.
    // We must collect all since there's no cursor in internalMutation,
    // but this is a one-time backfill and safe for production data volumes.
    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_viewerId")
      .collect();

    let processed = 0;
    let skipped = 0;

    for (const conversation of conversations) {
      if (!conversation.viewerId) {
        skipped++;
        continue;
      }
      const result = await rebuildConversationSummary(ctx, conversation._id);
      if (result.status === "ok") {
        processed++;
      } else {
        skipped++;
      }
    }

    return { processed, skipped };
  },
});

const SAFETY_PREFIX = (name: string) =>
  `You are a digital clone of ${name}. You represent their ideas and perspectives based on their writing and profile.
You must never: claim to be human, share private information not in your context, make commitments on behalf of the real person, or provide medical/legal/financial advice.`;

const DEFAULT_PERSONA =
  "Answer questions helpfully based on your profile information and published articles.";

export const loadStreamingContext = internalQuery({
  args: {
    conversationId: v.id("conversations"),
    profileOwnerId: v.id("users"),
  },
  returns: v.object({
    threadId: v.string(),
    systemPrompt: v.string(),
  }),
  handler: async (ctx, { conversationId, profileOwnerId }) => {
    const conversation = await ctx.db.get(conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }
    if (conversation.profileOwnerId !== profileOwnerId) {
      throw new Error("Conversation/profile owner mismatch");
    }

    const profileOwner = await ctx.db.get(profileOwnerId);
    if (!profileOwner) {
      throw new Error("Profile owner not found");
    }

    const name = profileOwner.name || "this person";
    const parts = [SAFETY_PREFIX(name)];

    if (profileOwner.bio) {
      parts.push(`Bio: ${profileOwner.bio}`);
    }

    parts.push(profileOwner.personaPrompt || DEFAULT_PERSONA);

    return {
      threadId: conversation.threadId,
      systemPrompt: parts.join("\n\n"),
    };
  },
});

export const getLastUserMessage = internalQuery({
  args: {
    threadId: v.string(),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, { threadId }) => {
    // Paginate through all messages to handle long threads
    let cursor: string | null = null;
    let lastUserText: string | null = null;

    while (true) {
      const result = await listMessages(ctx, components.agent, {
        threadId,
        paginationOpts: { numItems: 100, cursor },
        excludeToolMessages: true,
      });

      // Messages are in ascending order; track the latest user message
      for (const msg of result.page) {
        if (msg.message?.role !== "user") continue;

        const content = msg.message.content;
        if (typeof content === "string") {
          lastUserText = content;
          continue;
        }

        if (!Array.isArray(content)) continue;

        const text = content
          .filter(
            (p): p is { type: "text"; text: string } => p.type === "text",
          )
          .map((p) => p.text)
          .join("");
        if (text) lastUserText = text;
      }

      if (result.isDone) break;
      cursor = result.continueCursor;
    }

    return lastUserText;
  },
});
