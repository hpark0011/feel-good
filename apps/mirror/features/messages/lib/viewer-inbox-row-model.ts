/**
 * View-model mapper for viewer inbox rows.
 * Maps raw query results into a renderable shape for messages-inbox-row.
 *
 * Deliberately kept pure so it can be unit-tested without Convex.
 */

export type ViewerInboxRowInput = {
  conversationId: string;
  username: string;
  /** Display name — null when the author hasn't set one */
  displayName: string | null;
  avatarUrl: string | null;
  status: "active" | "archived";
  lastMessagePreview: string;
  lastActivityAt: number;
  lastMessageRole: "user" | "assistant";
};

export type ViewerInboxRow = {
  conversationId: string;
  username: string;
  /** Human-readable author label: displayName if available, else @username */
  authorLabel: string;
  avatarUrl: string | null;
  status: "active" | "archived";
  lastMessagePreview: string;
  lastActivityAt: number;
  lastMessageRole: "user" | "assistant";
  href: string;
};

export function mapViewerInboxRow(input: ViewerInboxRowInput): ViewerInboxRow {
  return {
    conversationId: input.conversationId,
    username: input.username,
    authorLabel: input.displayName ?? `@${input.username}`,
    avatarUrl: input.avatarUrl,
    status: input.status,
    lastMessagePreview: input.lastMessagePreview,
    lastActivityAt: input.lastActivityAt,
    lastMessageRole: input.lastMessageRole,
    href: `/@${input.username}/chat/${input.conversationId}`,
  };
}
