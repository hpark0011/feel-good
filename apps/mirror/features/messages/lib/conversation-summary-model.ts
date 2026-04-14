/**
 * Pure helpers for inbox summary maintenance.
 *
 * These mirror the logic that the Convex backend (Phase 2a) will implement in
 * packages/convex/convex/chat/helpers.ts. They live here as a client-reachable
 * pure layer so unit tests can exercise the logic without Convex runtime deps.
 *
 * When Phase 2a lands, these helpers become thin wrappers or are deleted in
 * favour of importing from the shared chat domain package.
 */

/** Normalize preview: collapse whitespace, cap at 140 chars */
export function normalizePreview(raw: string): string {
  return raw.replace(/\s+/g, " ").trim().slice(0, 140);
}

/**
 * Derive a deterministic sort key from a Unix-ms timestamp and a stable
 * tie-breaker (typically the conversationId).
 *
 * Shape: `${timestamp}-${tieBreaker}` — lexicographic sort gives newest-first
 * when used in descending order.
 */
export function buildSortKey(timestampMs: number, tieBreaker: string): string {
  return `${timestampMs.toString().padStart(16, "0")}-${tieBreaker}`;
}

export type ConversationSummaryFields = {
  lastActivityAt: number;
  lastActivitySortKey: string;
  lastMessagePreview: string;
  lastMessageRole: "user" | "assistant";
};

export type MessageRecord = {
  role: "user" | "assistant";
  content: string;
  createdAt: number;
};

/**
 * Build summary fields from a user send event. Called immediately after a new
 * user message is accepted, before the assistant responds.
 */
export function buildSummaryFromUserSend(
  conversationId: string,
  message: MessageRecord,
): ConversationSummaryFields {
  const preview = normalizePreview(message.content);
  const lastActivityAt = message.createdAt;
  return {
    lastActivityAt,
    lastActivitySortKey: buildSortKey(lastActivityAt, conversationId),
    lastMessagePreview: preview,
    lastMessageRole: "user",
  };
}

/**
 * Rebuild canonical summary after assistant completion. Takes the full message
 * history (already sorted by createdAt asc) and derives summary from the most
 * recent message regardless of role.
 *
 * Returns `{ status: "ok", summary }` when the latest message is an assistant
 * message, or `{ status: "retry" }` when assistant content isn't visible yet
 * (i.e., the newest message is still the user send).
 */
export type RebuildResult =
  | { status: "ok"; summary: ConversationSummaryFields }
  | { status: "retry" };

export function rebuildCanonicalSummary(
  conversationId: string,
  messages: MessageRecord[],
  expectedRole: "assistant" | null = "assistant",
): RebuildResult {
  if (messages.length === 0) {
    return { status: "retry" };
  }

  const latest = messages[messages.length - 1];

  if (expectedRole === "assistant" && latest.role !== "assistant") {
    // Assistant message hasn't landed yet — signal caller to retry
    return { status: "retry" };
  }

  const preview = normalizePreview(latest.content);
  const lastActivityAt = latest.createdAt;
  return {
    status: "ok",
    summary: {
      lastActivityAt,
      lastActivitySortKey: buildSortKey(lastActivityAt, conversationId),
      lastMessagePreview: preview,
      lastMessageRole: latest.role,
    },
  };
}

/**
 * Derive backfill summary for a pre-feature conversation from its full message
 * history. Idempotent — safe to run multiple times.
 */
export function deriveBackfillSummary(
  conversationId: string,
  messages: MessageRecord[],
): ConversationSummaryFields | null {
  if (messages.length === 0) return null;

  const latest = messages[messages.length - 1];
  const preview = normalizePreview(latest.content);
  const lastActivityAt = latest.createdAt;
  return {
    lastActivityAt,
    lastActivitySortKey: buildSortKey(lastActivityAt, conversationId),
    lastMessagePreview: preview,
    lastMessageRole: latest.role,
  };
}

/**
 * Detect and repair a stale summary: if the stored summary fields don't match
 * what would be derived from the current message history, return the corrected
 * fields; otherwise return null (no repair needed).
 */
export function repairStaleSummary(
  conversationId: string,
  stored: ConversationSummaryFields,
  messages: MessageRecord[],
): ConversationSummaryFields | null {
  const canonical = deriveBackfillSummary(conversationId, messages);
  if (!canonical) return null;

  const isStale =
    stored.lastActivityAt !== canonical.lastActivityAt ||
    stored.lastMessagePreview !== canonical.lastMessagePreview ||
    stored.lastMessageRole !== canonical.lastMessageRole;

  return isStale ? canonical : null;
}
