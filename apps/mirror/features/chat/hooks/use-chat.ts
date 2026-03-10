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

function countMessagesByRole(messages: UIMessage[]) {
  let user = 0;
  let assistant = 0;

  for (const message of messages) {
    if (message.role === "user") {
      user += 1;
    } else if (message.role === "assistant") {
      assistant += 1;
    }
  }

  return { user, assistant };
}

function findInsertIndexBeforeNewAssistant(
  messages: UIMessage[],
  assistantBaseline: number,
) {
  let seenAssistantCount = 0;

  for (let index = 0; index < messages.length; index += 1) {
    if (messages[index]?.role !== "assistant") continue;
    if (seenAssistantCount === assistantBaseline) {
      return index;
    }
    seenAssistantCount += 1;
  }

  return messages.length;
}

function findFirstNewAssistant(
  messages: UIMessage[],
  assistantBaseline: number,
) {
  let seenAssistantCount = 0;

  for (let index = 0; index < messages.length; index += 1) {
    const message = messages[index];

    if (message?.role !== "assistant") continue;
    if (seenAssistantCount === assistantBaseline) {
      return { index, message };
    }
    seenAssistantCount += 1;
  }

  return null;
}

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
  const [pendingAssistantMessage, setPendingAssistantMessage] =
    useState<UIMessage | null>(null);
  const createdConversationRef = useRef<Id<"conversations"> | null>(null);
  const realUserCountBaselineRef = useRef<number | null>(null);
  const realAssistantCountBaselineRef = useRef<number | null>(null);
  const hasObservedStreamingRef = useRef(false);

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
  const messageCounts = useMemo(() => countMessagesByRole(messages), [messages]);
  const realUserCount = messageCounts.user;
  const realAssistantCount = messageCounts.assistant;
  const userBaseline = realUserCountBaselineRef.current ?? 0;
  const assistantBaseline = realAssistantCountBaselineRef.current ?? 0;
  const firstNewAssistant = useMemo(
    () => findFirstNewAssistant(messages, assistantBaseline),
    [messages, assistantBaseline],
  );
  const firstNewAssistantMessage = firstNewAssistant?.message ?? null;
  const firstNewAssistantHasText = firstNewAssistantMessage !== null
    && firstNewAssistantMessage.text.length > 0;
  const firstNewAssistantSettledWithoutText = firstNewAssistantMessage !== null
    && firstNewAssistantMessage.text.length === 0
    && (
      firstNewAssistantMessage.status === "success"
      || firstNewAssistantMessage.status === "failed"
    );
  const assistantResponseSettled = firstNewAssistantSettledWithoutText
    || (hasObservedStreamingRef.current && !isStreaming && !firstNewAssistantHasText);
  const showOptimisticMessages =
    optimisticMessages.length > 0 && realUserCount <= userBaseline;
  const showPendingAssistant =
    pendingAssistantMessage !== null
    && !firstNewAssistantHasText
    && !assistantResponseSettled;
  const shouldSuppressEmptyNewAssistant =
    showPendingAssistant
    && firstNewAssistantMessage !== null
    && firstNewAssistantMessage.text.length === 0;

  // Merge optimistic + real messages
  const mergedMessages = useMemo(() => {
    if (!showOptimisticMessages && !showPendingAssistant) return messages;

    let displayMessages = messages;

    if (showOptimisticMessages) {
      const hasNewAssistantMessages = realAssistantCount > assistantBaseline;
      const insertIndex = hasNewAssistantMessages
        ? findInsertIndexBeforeNewAssistant(messages, assistantBaseline)
        : messages.length;

      displayMessages = hasNewAssistantMessages
        ? [
          ...messages.slice(0, insertIndex),
          ...optimisticMessages,
          ...messages.slice(insertIndex),
        ]
        : [...messages, ...optimisticMessages];
    }

    if (shouldSuppressEmptyNewAssistant && firstNewAssistantMessage) {
      displayMessages = displayMessages.filter(
        (message) => message.key !== firstNewAssistantMessage.key,
      );
    }

    if (showPendingAssistant && pendingAssistantMessage) {
      return [...displayMessages, pendingAssistantMessage];
    }

    return displayMessages;
  }, [
    messages,
    optimisticMessages,
    pendingAssistantMessage,
    showOptimisticMessages,
    showPendingAssistant,
    shouldSuppressEmptyNewAssistant,
    firstNewAssistantMessage,
  ]);

  // Clear optimistic messages when real messages arrive.
  // Count-based: when real user message count exceeds the baseline captured
  // at send time, the server has persisted our message.
  useEffect(() => {
    if (optimisticMessages.length === 0) return;
    if (realUserCount > userBaseline) {
      setOptimisticMessages([]);
      realUserCountBaselineRef.current = null;
    }
  }, [optimisticMessages.length, realUserCount, userBaseline]);

  useEffect(() => {
    if (!pendingAssistantMessage) return;
    if (isStreaming) {
      hasObservedStreamingRef.current = true;
    }
  }, [pendingAssistantMessage, isStreaming]);

  useEffect(() => {
    if (!pendingAssistantMessage) return;
    if (firstNewAssistantHasText || assistantResponseSettled) {
      setPendingAssistantMessage(null);
      realAssistantCountBaselineRef.current = null;
      hasObservedStreamingRef.current = false;
    }
  }, [
    pendingAssistantMessage,
    firstNewAssistantHasText,
    assistantResponseSettled,
  ]);

  // Override status to prevent loading spinner flash when optimistic messages
  // exist or when no conversation has been created yet.
  const isResponding = isStreaming || showPendingAssistant;
  const resolvedStatus =
    showOptimisticMessages || showPendingAssistant
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

      // Create optimistic messages immediately so both the user bubble and
      // assistant placeholder render before the backend stream arrives.
      const optimisticTimestamp = Date.now();
      const optimisticKey = `optimistic-user-${optimisticTimestamp}`;
      const optimisticMsg = {
        key: optimisticKey,
        id: optimisticKey,
        role: "user" as const,
        text: content,
        status: "pending" as const,
        parts: [{ type: "text" as const, text: content }],
        order: optimisticTimestamp,
        stepOrder: 0,
        _creationTime: optimisticTimestamp,
      } satisfies UIMessage;

      const optimisticAssistantKey = `optimistic-assistant-${optimisticTimestamp}`;
      const optimisticAssistantMsg = {
        key: optimisticAssistantKey,
        id: optimisticAssistantKey,
        role: "assistant" as const,
        text: "",
        status: "streaming" as const,
        parts: [],
        order: optimisticTimestamp + 1,
        stepOrder: 0,
        _creationTime: optimisticTimestamp + 1,
      } satisfies UIMessage;

      realUserCountBaselineRef.current = realUserCount;
      realAssistantCountBaselineRef.current = realAssistantCount;
      hasObservedStreamingRef.current = false;

      setOptimisticMessages((prev) => [...prev, optimisticMsg]);
      setPendingAssistantMessage(optimisticAssistantMsg);
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
        setPendingAssistantMessage(null);
        realUserCountBaselineRef.current = null;
        realAssistantCountBaselineRef.current = null;
        hasObservedStreamingRef.current = false;
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
    [
      sendMessageMutation,
      profileOwnerId,
      conversationId,
      onConversationCreated,
      realUserCount,
      realAssistantCount,
    ],
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
      setPendingAssistantMessage(null);
      realUserCountBaselineRef.current = null;
      realAssistantCountBaselineRef.current = null;
      hasObservedStreamingRef.current = false;
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
    isResponding,
    conversation,
    conversationNotFound,
    status: resolvedStatus,
    loadMore,
    sendError,
    clearSendError,
    sendAnimationKey,
  };
}
