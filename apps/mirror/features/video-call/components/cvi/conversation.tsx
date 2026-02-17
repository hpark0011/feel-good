"use client";

import { useDaily, useParticipantIds, useDailyEvent, DailyVideo } from "@daily-co/daily-react";
import { useEffect, useCallback } from "react";

type ConversationProps = {
  conversationUrl: string;
  onJoined?: () => void;
  onLeft?: () => void;
  onError?: (error: string) => void;
};

export function Conversation({
  conversationUrl,
  onJoined,
  onLeft,
  onError,
}: ConversationProps) {
  const daily = useDaily();
  const participantIds = useParticipantIds();

  const joinRoom = useCallback(async () => {
    if (!daily) return;
    try {
      await daily.join({ url: conversationUrl });
      onJoined?.();
    } catch (err) {
      onError?.(err instanceof Error ? err.message : "Failed to join conversation");
    }
  }, [daily, conversationUrl, onJoined, onError]);

  useDailyEvent("left-meeting", useCallback(() => {
    onLeft?.();
  }, [onLeft]));

  useEffect(() => {
    joinRoom();
    return () => {
      daily?.leave();
    };
  }, [joinRoom, daily]);

  return (
    <div className="relative h-full w-full">
      {participantIds.map((id) => (
        <DailyVideo key={id} sessionId={id} type="video" fit="cover" />
      ))}
    </div>
  );
}
