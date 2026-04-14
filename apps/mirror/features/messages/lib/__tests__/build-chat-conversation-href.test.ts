import { describe, it, expect } from "vitest";
import { buildChatConversationHref } from "../build-chat-conversation-href";
import type { Id } from "@feel-good/convex/convex/_generated/dataModel";

// ---------------------------------------------------------------------------
// buildChatConversationHref — FR-04
// ---------------------------------------------------------------------------

describe("buildChatConversationHref", () => {
  it("builds /@username/chat/[conversationId] links from viewer inbox rows", () => {
    const conversationId = "conv_abc123" as Id<"conversations">;
    const href = buildChatConversationHref("rick-rubin", conversationId);
    expect(href).toBe("/@rick-rubin/chat/conv_abc123");
  });

  it("returns /@rick-rubin/chat/<conversationId> for a known row", () => {
    const conversationId = "conv_xyz789" as Id<"conversations">;
    const href = buildChatConversationHref("rick-rubin", conversationId);
    expect(href).toBe("/@rick-rubin/chat/conv_xyz789");
  });

  it("uses the at-sign prefix on the username", () => {
    const conversationId = "conv_000" as Id<"conversations">;
    const href = buildChatConversationHref("some-author", conversationId);
    expect(href.startsWith("/@")).toBe(true);
  });

  it("includes /chat/ segment between username and conversationId", () => {
    const conversationId = "conv_001" as Id<"conversations">;
    const href = buildChatConversationHref("writer", conversationId);
    expect(href).toContain("/chat/");
  });
});
