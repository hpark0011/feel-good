"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { UIMessage } from "@convex-dev/agent/react";
import {
  MOCK_MESSAGES,
  MOCK_STREAMING_TEXT,
} from "../lib/mock-chat-data";

type UseMockChatReturn = {
  messages: UIMessage[];
  sendMessage: (content: string) => void;
  retryMessage: () => void;
  isStreaming: boolean;
  conversationNotFound: false;
  status: "Exhausted";
  loadMore: (numItems: number) => void;
  sendError: string | null;
  clearSendError: () => void;
  sendAnimationKey: string | null;
};

let mockKeyCounter = 100;
function nextKey() {
  return `mock-${++mockKeyCounter}`;
}

function createUserMessage(text: string, order: number): UIMessage {
  return {
    id: nextKey(),
    key: nextKey(),
    role: "user",
    text,
    status: "success",
    parts: [{ type: "text" as const, text }],
    order,
    stepOrder: 0,
    _creationTime: Date.now(),
    createdAt: new Date(),
  } as UIMessage;
}

function createStreamingMessage(order: number): UIMessage {
  return {
    id: nextKey(),
    key: nextKey(),
    role: "assistant",
    text: "",
    status: "streaming",
    parts: [{ type: "text" as const, text: "" }],
    order,
    stepOrder: 0,
    _creationTime: Date.now(),
    createdAt: new Date(),
  } as UIMessage;
}

export function useMockChat(): UseMockChatReturn {
  const [messages, setMessages] = useState<UIMessage[]>(MOCK_MESSAGES);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [sendAnimationKey, setSendAnimationKey] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamIndexRef = useRef(0);
  const streamTextRef = useRef(MOCK_STREAMING_TEXT);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Clear animation key after the CSS animation completes (400ms)
  useEffect(() => {
    if (!sendAnimationKey) return;
    const timer = setTimeout(() => setSendAnimationKey(null), 500);
    return () => clearTimeout(timer);
  }, [sendAnimationKey]);

  const startStreaming = useCallback((targetText: string) => {
    streamIndexRef.current = 0;
    streamTextRef.current = targetText;
    setIsStreaming(true);

    intervalRef.current = setInterval(() => {
      streamIndexRef.current += 2;
      const currentIndex = streamIndexRef.current;
      const fullText = streamTextRef.current;

      if (currentIndex >= fullText.length) {
        // Stream complete
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsStreaming(false);

        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (!last || last.role !== "assistant") return prev;
          return [
            ...prev.slice(0, -1),
            {
              ...last,
              text: fullText,
              status: "success" as const,
              parts: [{ type: "text" as const, text: fullText }],
            } as UIMessage,
          ];
        });
        return;
      }

      const partialText = fullText.slice(0, currentIndex);
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (!last || last.role !== "assistant") return prev;
        return [
          ...prev.slice(0, -1),
          {
            ...last,
            text: partialText,
            parts: [{ type: "text" as const, text: partialText }],
          } as UIMessage,
        ];
      });
    }, 30);
  }, []);

  const sendMessage = useCallback(
    (content: string) => {
      if (isStreaming) return;
      setSendError(null);

      const nextOrder = messages.length + 1;
      const userMsg = createUserMessage(content, nextOrder);
      const assistantMsg = createStreamingMessage(nextOrder + 1);

      setSendAnimationKey(userMsg.key);
      setMessages((prev) => [...prev, userMsg, assistantMsg]);

      // Start streaming after a short delay to mimic network latency
      setTimeout(() => {
        startStreaming(MOCK_STREAMING_TEXT);
      }, 300);
    },
    [isStreaming, messages.length, startStreaming],
  );

  const retryMessage = useCallback(() => {
    if (isStreaming) return;
    setSendError(null);

    setMessages((prev) => {
      const lastIdx = prev.length - 1;
      const last = prev[lastIdx];
      if (!last || last.status !== "failed") return prev;
      return [
        ...prev.slice(0, lastIdx),
        { ...last, text: "", status: "streaming" as const } as UIMessage,
      ];
    });

    setTimeout(() => {
      startStreaming(MOCK_STREAMING_TEXT);
    }, 300);
  }, [isStreaming, startStreaming]);

  const clearSendError = useCallback(() => setSendError(null), []);
  const loadMore = useCallback(() => {}, []);

  return {
    messages,
    sendMessage,
    retryMessage,
    isStreaming,
    conversationNotFound: false,
    status: "Exhausted",
    loadMore,
    sendError,
    clearSendError,
    sendAnimationKey,
  };
}
