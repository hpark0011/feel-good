"use node";

import { v } from "convex/values";
import { embed } from "ai";
import { google } from "@ai-sdk/google";
import { internalAction } from "../_generated/server";
import { internal } from "../_generated/api";
import { cloneAgent } from "./agent";

const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;
const RAG_RESULT_LIMIT = 5;

export const streamResponse = internalAction({
  args: {
    conversationId: v.id("conversations"),
    profileOwnerId: v.id("users"),
    promptMessageId: v.optional(v.string()),
    lockStartedAt: v.number(),
    userMessage: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, { conversationId, profileOwnerId, promptMessageId, lockStartedAt, userMessage }) => {
    try {
      const { threadId, systemPrompt } = await ctx.runQuery(
        internal.chat.helpers.loadStreamingContext,
        { conversationId, profileOwnerId },
      );

      // RAG: embed user message and retrieve relevant content
      let ragContext = "";
      if (userMessage) {
        try {
          const { embedding } = await embed({
            model: google.textEmbeddingModel(EMBEDDING_MODEL),
            value: userMessage,
            providerOptions: {
              google: { outputDimensionality: EMBEDDING_DIMENSIONS },
            },
          });

          const vectorResults = await ctx.vectorSearch(
            "contentEmbeddings",
            "by_embedding",
            {
              vector: embedding,
              limit: RAG_RESULT_LIMIT,
              filter: (q) => q.eq("userId", profileOwnerId),
            },
          );

          if (vectorResults.length > 0) {
            const chunks = await ctx.runQuery(
              internal.embeddings.queries.fetchChunksByIds,
              { ids: vectorResults.map((r) => r._id) },
            );

            if (chunks.length > 0) {
              const contextParts = chunks.map(
                (c: { title: string; chunkText: string }) =>
                  `### ${c.title}\n${c.chunkText}`,
              );
              ragContext = `\n\n## Relevant Content from Your Writing\n\n${contextParts.join("\n\n")}`;
            }
          }
        } catch (error) {
          console.error("RAG retrieval failed, continuing without context:", error);
        }
      }

      const fullSystemPrompt = systemPrompt + ragContext;

      const { thread } = await cloneAgent.continueThread(ctx, { threadId });

      // Empty or undefined promptMessageId = retry: respond to latest user message
      const streamArgs = promptMessageId
        ? { promptMessageId, system: fullSystemPrompt }
        : { system: fullSystemPrompt };

      await thread.streamText(
        streamArgs,
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
