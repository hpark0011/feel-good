"use client";

import { useChatSearchParams } from "@/hooks/use-chat-search-params";
import { ChatPanel } from "./chat-panel";
import { ProfilePanel } from "./profile-panel";

export function InteractionPanel() {
  const { isChatOpen } = useChatSearchParams();
  return isChatOpen ? <ChatPanel /> : <ProfilePanel />;
}
