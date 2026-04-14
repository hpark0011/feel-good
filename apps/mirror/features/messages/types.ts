import type { Id } from "@feel-good/convex/convex/_generated/dataModel";

export type ViewerInboxRow = {
  conversationId: Id<"conversations">;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  status: "active" | "archived";
  lastMessagePreview: string | null;
  lastMessageRole: "user" | "assistant" | null;
  lastActivityAt: number | null;
};
