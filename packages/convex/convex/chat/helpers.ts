import { v } from "convex/values";
import { listMessages } from "@convex-dev/agent";
import { internalQuery } from "../_generated/server";
import { components } from "../_generated/api";

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
    const result = await listMessages(ctx, components.agent, {
      threadId,
      paginationOpts: { numItems: 20, cursor: null },
      excludeToolMessages: true,
    });

    // Messages are in ascending order; walk backwards to find last user message
    for (let i = result.page.length - 1; i >= 0; i--) {
      const msg = result.page[i]!;
      if (msg.message?.role === "user") {
        const content = msg.message.content;
        if (typeof content === "string") return content;
        // Handle content parts
        if (Array.isArray(content)) {
          const textPart = content.find(
            (p): p is { type: "text"; text: string } => p.type === "text",
          );
          return textPart?.text ?? null;
        }
      }
    }

    return null;
  },
});
