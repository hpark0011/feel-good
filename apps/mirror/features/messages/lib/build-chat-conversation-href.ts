import type { Id } from "@feel-good/convex/convex/_generated/dataModel";

export function buildChatConversationHref(
  username: string,
  conversationId: Id<"conversations">,
): string {
  return `/@${username}/chat/${conversationId}`;
}
