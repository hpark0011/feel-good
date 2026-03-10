"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMutation, useQuery } from "convex/react";
import { useUIMessages, type UIMessage } from "@convex-dev/agent/react";
import { api } from "@feel-good/convex/convex/_generated/api";
import type { Id } from "@feel-good/convex/convex/_generated/dataModel";

type UseChatOptions = {
  profileOwnerId: Id<"users">;
  conversationId: Id<"conversations"> | null;
  onConversationCreated?: (id: Id<"conversations">) => void;
};

// Our listThreadMessages query uses `conversationId` alongside `threadId` for
// access control, but useUIMessages expects `threadId` as the sole identifier.
// This type assertion bridges the gap — runtime behavior is correct since the
// hook passes all args through to usePaginatedQuery. The `stream: true` option
// also needs the assertion because the StreamQuery constraint checks for
// threadId-only args.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const listMessagesQuery = api.chat.queries.listThreadMessages as any;

const EMPTY_MESSAGES: UIMessage[] = [];

export function useChat({
  profileOwnerId,
  conversationId,
  onConversationCreated,
}: UseChatOptions) {
  const sendMessageMutation = useMutation(api.chat.mutations.sendMessage);
  const retryMessageMutation = useMutation(api.chat.mutations.retryMessage);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendAnimationKey, setSendAnimationKey] = useState<string | null>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<UIMessage[]>([]);
  const createdConversationRef = useRef<Id<"conversations"> | null>(null);
  const realUserCountBaselineRef = useRef<number | null>(null);

  const conversation = useQuery(
    api.chat.queries.getConversation,
    conversationId ? { conversationId } : "skip",
  );

  const conversationNotFound = conversationId !== null && conversation === null;

  // useUIMessages requires threadId at runtime for streaming delta construction.
  // We get it from the conversation metadata query above.
  const { results, status, loadMore } = useUIMessages(
    listMessagesQuery,
    conversation
      ? { threadId: conversation.threadId, conversationId: conversation._id }
      : "skip",
    { initialNumItems: 20, stream: true },
  );

  // Stabilise the messages array — `results` is undefined when the query is
  // skipped, and `?? []` would create a new reference every render.
  const messages = (results as UIMessage[] | undefined) ?? EMPTY_MESSAGES;
  const isStreaming = conversation?.streamingInProgress ?? false;

  // Merge optimistic + real messages
  const mergedMessages = useMemo(() => {
    if (optimisticMessages.length === 0) return messages;
    const realUserCount = messages.filter((m) => m.role === "user").length;
    const baseline = realUserCountBaselineRef.current ?? 0;
    const pending = realUserCount > baseline ? [] : optimisticMessages;
    return [...messages, ...pending];
  }, [messages, optimisticMessages]);

  // Clear optimistic messages when real messages arrive.
  // Count-based: when real user message count exceeds the baseline captured
  // at send time, the server has persisted our message.
  useEffect(() => {
    if (optimisticMessages.length === 0) return;
    const realUserCount = messages.filter((m) => m.role === "user").length;
    const baseline = realUserCountBaselineRef.current ?? 0;
    if (realUserCount > baseline) {
      setOptimisticMessages([]);
      realUserCountBaselineRef.current = null;
    }
  }, [messages, optimisticMessages.length]);

  // Override status to prevent loading spinner flash when optimistic messages
  // exist or when no conversation has been created yet.
  const resolvedStatus =
    optimisticMessages.length > 0
      ? "Exhausted"
      : conversationId === null
        ? "Exhausted"
        : status;

  const isSendingRef = useRef(false);

  const sendMessage = useCallback(
    async (content: string) => {
      if (isSendingRef.current) return;
      isSendingRef.current = true;
      setSendError(null);

      // Create optimistic message immediately
      const optimisticKey = `optimistic-${Date.now()}`;
      const optimisticMsg = {
        key: optimisticKey,
        id: optimisticKey,
        role: "user" as const,
        text: content,
        status: "pending" as const,
        parts: [{ type: "text" as const, text: content }],
        order: Date.now(),
        stepOrder: 0,
        _creationTime: Date.now(),
      } satisfies UIMessage;

      const currentRealUserCount = messages.filter(
        (m) => m.role === "user",
      ).length;
      realUserCountBaselineRef.current = currentRealUserCount;

      setOptimisticMessages((prev) => [...prev, optimisticMsg]);
      setSendAnimationKey(optimisticKey);

      try {
        const result = await sendMessageMutation({
          profileOwnerId,
          conversationId: conversationId ?? undefined,
          content,
        });

        // First message creates a new conversation — notify parent.
        // Track the created ID so the conversation switch effect preserves
        // optimistic messages instead of prematurely clearing them.
        if (!conversationId && result.conversationId) {
          createdConversationRef.current = result.conversationId;
          onConversationCreated?.(result.conversationId);
        }
      } catch (err) {
        setOptimisticMessages([]);
        realUserCountBaselineRef.current = null;
        const msg =
          err instanceof Error ? err.message : "Failed to send message";
        if (/rate limit/i.test(msg)) {
          setSendError(
            "You're sending messages too quickly. Please wait a moment.",
          );
        } else if (/authentication required/i.test(msg)) {
          setSendError("You need to sign in to chat.");
        } else if (/already being generated/i.test(msg)) {
          setSendError("Please wait for the current response to complete.");
        } else {
          setSendError(msg);
        }
      } finally {
        isSendingRef.current = false;
      }
    },
    [sendMessageMutation, profileOwnerId, conversationId, onConversationCreated, messages],
  );

  // Clear animation key after the CSS animation completes (400ms) to prevent
  // replays on React reconciliation / Convex re-pagination.
  useEffect(() => {
    if (!sendAnimationKey) return;
    const timer = setTimeout(() => setSendAnimationKey(null), 500);
    return () => clearTimeout(timer);
  }, [sendAnimationKey]);

  // Reset on conversation switch.
  // When the switch is caused by our own first-message creation, preserve
  // optimistic messages so there's no loading spinner flash before real
  // messages arrive. For user-initiated navigation, clear everything.
  useEffect(() => {
    setSendAnimationKey(null);
    if (conversationId === createdConversationRef.current) {
      createdConversationRef.current = null;
    } else {
      setOptimisticMessages([]);
      realUserCountBaselineRef.current = null;
    }
  }, [conversationId]);

  // Safety timeout — clear stuck optimistic messages after 10s in case
  // dedup fails for any reason (e.g. text mismatch between client/server).
  useEffect(() => {
    if (optimisticMessages.length === 0) return;
    const timer = setTimeout(() => setOptimisticMessages([]), 10_000);
    return () => clearTimeout(timer);
  }, [optimisticMessages.length]);

  const retryMessage = useCallback(async () => {
    if (!conversationId) return;
    setSendError(null);

    try {
      await retryMessageMutation({ conversationId });
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to retry";
      setSendError(msg);
    }
  }, [retryMessageMutation, conversationId]);

  const clearSendError = useCallback(() => {
    setSendError(null);
  }, []);

  return {
    messages: mergedMessages,
    sendMessage,
    retryMessage,
    isStreaming,
    conversation,
    conversationNotFound,
    status: resolvedStatus,
    loadMore,
    sendError,
    clearSendError,
    sendAnimationKey,
  };
}
