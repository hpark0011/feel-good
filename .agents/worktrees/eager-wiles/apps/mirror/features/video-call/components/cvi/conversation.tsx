"use client";

import { useDaily, useDailyEvent } from "@daily-co/daily-react";
import { useEffect, useCallback } from "react";

type ConversationProps = {
  conversationUrl: string;
  onJoined?: () => void;
  onLeft?: () => void;
  onError?: (error: string) => void;
};

/**
 * Headless component that manages the Daily.co room lifecycle.
 * Joins the room on mount and leaves on unmount.
 * Video rendering is handled by VideoCall.
 */
export function Conversation({
  conversationUrl,
  onJoined,
  onLeft,
  onError,
}: ConversationProps) {
  const daily = useDaily();

  useDailyEvent(
    "left-meeting",
    useCallback(() => {
      onLeft?.();
    }, [onLeft])
  );

  useEffect(() => {
    if (!daily) return;
    let cancelled = false;

    daily
      .join({ url: conversationUrl })
      .then(() => {
        if (!cancelled) onJoined?.();
      })
      .catch((err) => {
        if (!cancelled) {
          onError?.(
            err instanceof Error ? err.message : "Failed to join conversation"
          );
        }
      });

    return () => {
      cancelled = true;
      daily.leave().catch(() => {});
    };
  }, [daily, conversationUrl, onJoined, onError]);

  return null;
}
