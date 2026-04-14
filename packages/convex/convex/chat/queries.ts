import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { listUIMessages, syncStreams, vStreamArgs } from "@convex-dev/agent";
import { query, internalQuery } from "../_generated/server";
import { components } from "../_generated/api";
import { authComponent } from "../auth/client";

export const getConversation = query({
  args: {
    conversationId: v.id("conversations"),
  },
  returns: v.union(
    v.object({
      _id: v.id("conversations"),
      _creationTime: v.number(),
      profileOwnerId: v.id("users"),
      viewerId: v.optional(v.id("users")),
      threadId: v.string(),
      status: v.union(v.literal("active"), v.literal("archived")),
      title: v.string(),
      streamingInProgress: v.optional(v.boolean()),
    }),
    v.null(),
  ),
  handler: async (ctx, { conversationId }) => {
    const conversation = await ctx.db.get(conversationId);
    if (!conversation) return null;

    const authUser = await authComponent.safeGetAuthUser(ctx);
    let appUser = null;
    if (authUser) {
      appUser = await ctx.db
        .query("users")
        .withIndex("by_authId", (q) => q.eq("authId", authUser._id))
        .unique();
    }

    const conversationData = {
      _id: conversation._id,
      _creationTime: conversation._creationTime,
      profileOwnerId: conversation.profileOwnerId,
      viewerId: conversation.viewerId,
      threadId: conversation.threadId,
      status: conversation.status,
      title: conversation.title,
      streamingInProgress: conversation.streamingInProgress,
    };

    // Owner can see all conversations on their profile
    if (appUser && appUser._id === conversation.profileOwnerId) {
      return conversationData;
    }

    // Authenticated viewer sees only their own conversations
    if (appUser && conversation.viewerId === appUser._id) {
      return conversationData;
    }

    // Anonymous: can see anonymous conversations they have the ID for
    if (!appUser && conversation.viewerId === undefined) {
      return conversationData;
    }

    return null;
  },
});

export const getConversations = query({
  args: {
    profileOwnerId: v.id("users"),
  },
  returns: v.array(
    v.object({
      _id: v.id("conversations"),
      _creationTime: v.number(),
      profileOwnerId: v.id("users"),
      viewerId: v.optional(v.id("users")),
      threadId: v.string(),
      status: v.union(v.literal("active"), v.literal("archived")),
      title: v.string(),
      streamingInProgress: v.optional(v.boolean()),
    }),
  ),
  handler: async (ctx, { profileOwnerId }) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) return [];

    const appUser = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", authUser._id))
      .unique();
    if (!appUser) return [];

    let conversations;

    if (appUser._id === profileOwnerId) {
      // Owner sees all conversations on their profile
      conversations = await ctx.db
        .query("conversations")
        .withIndex("by_profileOwnerId_and_viewerId", (q) =>
          q.eq("profileOwnerId", profileOwnerId),
        )
        .order("desc")
        .collect();
    } else {
      // Viewer sees only their own conversations with this profile
      conversations = await ctx.db
        .query("conversations")
        .withIndex("by_profileOwnerId_and_viewerId", (q) =>
          q.eq("profileOwnerId", profileOwnerId).eq("viewerId", appUser._id),
        )
        .order("desc")
        .collect();
    }

    return conversations.map((c) => ({
      _id: c._id,
      _creationTime: c._creationTime,
      profileOwnerId: c.profileOwnerId,
      viewerId: c.viewerId,
      threadId: c.threadId,
      status: c.status,
      title: c.title,
      streamingInProgress: c.streamingInProgress,
    }));
  },
});

export const listThreadMessages = query({
  args: {
    threadId: v.string(),
    conversationId: v.id("conversations"),
    paginationOpts: paginationOptsValidator,
    streamArgs: v.optional(vStreamArgs),
  },
  returns: v.any(),
  handler: async (ctx, { conversationId, paginationOpts, streamArgs }) => {
    const conversation = await ctx.db.get(conversationId);
    if (!conversation) return null;

    // Access gate
    const authUser = await authComponent.safeGetAuthUser(ctx);
    let appUser = null;
    if (authUser) {
      appUser = await ctx.db
        .query("users")
        .withIndex("by_authId", (q) => q.eq("authId", authUser._id))
        .unique();
    }

    const isOwner = appUser && appUser._id === conversation.profileOwnerId;
    const isViewer = appUser && conversation.viewerId === appUser._id;
    const isAnonymousConvo = !appUser && conversation.viewerId === undefined;

    if (!isOwner && !isViewer && !isAnonymousConvo) {
      return null;
    }

    const messages = await listUIMessages(ctx, components.agent, {
      threadId: conversation.threadId,
      paginationOpts,
    });

    const streams = streamArgs
      ? await syncStreams(ctx, components.agent, {
          threadId: conversation.threadId,
          streamArgs,
        })
      : undefined;

    return { ...messages, streams };
  },
});

export const getViewerConversations = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(
      v.object({
        conversationId: v.id("conversations"),
        username: v.string(),
        displayName: v.union(v.string(), v.null()),
        avatarUrl: v.union(v.string(), v.null()),
        status: v.union(v.literal("active"), v.literal("archived")),
        lastMessagePreview: v.union(v.string(), v.null()),
        lastMessageRole: v.union(
          v.literal("user"),
          v.literal("assistant"),
          v.null(),
        ),
        lastActivityAt: v.union(v.number(), v.null()),
      }),
    ),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => {
    const authUser = await authComponent.safeGetAuthUser(ctx);
    if (!authUser) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const appUser = await ctx.db
      .query("users")
      .withIndex("by_authId", (q) => q.eq("authId", authUser._id))
      .unique();
    if (!appUser) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    // Read conversations via the viewer/activity index in descending order
    const paginatedResult = await ctx.db
      .query("conversations")
      .withIndex("by_viewerId_and_lastActivitySortKey", (q) =>
        q.eq("viewerId", appUser._id),
      )
      .order("desc")
      .paginate(args.paginationOpts);

    // Join each profileOwnerId to the author user for username/displayName/avatarUrl
    const page = await Promise.all(
      paginatedResult.page.map(async (conversation) => {
        const author = await ctx.db.get(conversation.profileOwnerId);

        // Resolve avatar URL from storage if present
        let avatarUrl: string | null = null;
        if (author?.avatarStorageId) {
          avatarUrl = await ctx.storage.getUrl(author.avatarStorageId);
        }

        return {
          conversationId: conversation._id,
          username: author?.username ?? "",
          displayName: author?.name ?? null,
          avatarUrl,
          status: conversation.status,
          lastMessagePreview: conversation.lastMessagePreview ?? null,
          lastMessageRole: conversation.lastMessageRole ?? null,
          lastActivityAt: conversation.lastActivityAt ?? null,
        };
      }),
    );

    return {
      page,
      isDone: paginatedResult.isDone,
      continueCursor: paginatedResult.continueCursor,
    };
  },
});

export const internalGetConversation = internalQuery({
  args: {
    conversationId: v.id("conversations"),
  },
  returns: v.union(
    v.object({
      _id: v.id("conversations"),
      _creationTime: v.number(),
      profileOwnerId: v.id("users"),
      viewerId: v.optional(v.id("users")),
      threadId: v.string(),
      status: v.union(v.literal("active"), v.literal("archived")),
      title: v.string(),
      streamingInProgress: v.optional(v.boolean()),
      streamingStartedAt: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx, { conversationId }) => {
    return await ctx.db.get(conversationId);
  },
});
