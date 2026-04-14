/**
 * Viewer inbox query contract tests — FR-02, NFR-01, NFR-02, FR-07
 *
 * These tests exercise the pure data-shaping contracts that the Convex
 * getViewerConversations query will satisfy.  They do NOT invoke Convex — they
 * operate on plain fixture data and the same sort/filter helpers that the
 * query will use.
 */
import { describe, it, expect } from "vitest";
import { buildSortKey } from "../conversation-summary-model";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

type RawConversationRow = {
  _id: string;
  viewerId: string | null;
  profileOwnerId: string;
  status: "active" | "archived";
  lastActivityAt: number;
  lastActivitySortKey: string;
  lastMessagePreview: string;
  lastMessageRole: "user" | "assistant";
  authorUsername: string;
  authorDisplayName: string | null;
  authorAvatarUrl: string | null;
};

function makeRow(
  overrides: Partial<RawConversationRow> & {
    _id: string;
    viewerId: string | null;
  },
): RawConversationRow {
  return {
    profileOwnerId: "owner_001",
    status: "active",
    lastActivityAt: 1_000,
    lastActivitySortKey: buildSortKey(1_000, overrides._id),
    lastMessagePreview: "Hello",
    lastMessageRole: "user",
    authorUsername: "author",
    authorDisplayName: "Author Name",
    authorAvatarUrl: null,
    ...overrides,
  };
}

/**
 * Pure simulation of the getViewerConversations query logic:
 * - filter to viewerId
 * - exclude anonymous (null viewerId)
 * - sort by lastActivitySortKey descending
 * - paginate with cursor/limit
 */
function simulateGetViewerConversations(
  all: RawConversationRow[],
  viewerId: string,
  opts: { limit: number; cursor?: string },
): {
  rows: RawConversationRow[];
  continueCursor: string | null;
} {
  const filtered = all
    .filter((r) => r.viewerId === viewerId) // authenticated viewer only
    .sort((a, b) =>
      b.lastActivitySortKey.localeCompare(a.lastActivitySortKey),
    );

  const startIdx = opts.cursor
    ? filtered.findIndex((r) => r._id === opts.cursor) + 1
    : 0;

  const page = filtered.slice(startIdx, startIdx + opts.limit);
  const hasMore = startIdx + opts.limit < filtered.length;
  return {
    rows: page,
    continueCursor: hasMore ? page[page.length - 1]._id : null,
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("viewer inbox query contract", () => {
  it("filters mixed-author conversations to the authenticated viewer, paginates, and preserves newest-first order", () => {
    const VIEWER_ID = "viewer_alice";
    const OTHER_ID = "viewer_bob";

    const rows: RawConversationRow[] = [
      makeRow({
        _id: "conv_1",
        viewerId: VIEWER_ID,
        lastActivityAt: 1_000,
        lastActivitySortKey: buildSortKey(1_000, "conv_1"),
        authorUsername: "author-a",
      }),
      makeRow({
        _id: "conv_2",
        viewerId: VIEWER_ID,
        lastActivityAt: 3_000,
        lastActivitySortKey: buildSortKey(3_000, "conv_2"),
        authorUsername: "author-b",
      }),
      makeRow({
        _id: "conv_other",
        viewerId: OTHER_ID,
        lastActivityAt: 9_999,
        lastActivitySortKey: buildSortKey(9_999, "conv_other"),
        authorUsername: "author-c",
      }),
    ];

    const result = simulateGetViewerConversations(rows, VIEWER_ID, {
      limit: 10,
    });

    // Only alice's conversations
    expect(result.rows.every((r) => r.viewerId === VIEWER_ID)).toBe(true);
    expect(result.rows).toHaveLength(2);

    // Newest first: conv_2 (3000) before conv_1 (1000)
    expect(result.rows[0]._id).toBe("conv_2");
    expect(result.rows[1]._id).toBe("conv_1");

    // No next page
    expect(result.continueCursor).toBeNull();
  });

  it("returns a continuation cursor when more rows exist beyond the page size", () => {
    const VIEWER_ID = "viewer_alice";
    const rows: RawConversationRow[] = Array.from({ length: 5 }, (_, i) =>
      makeRow({
        _id: `conv_${i}`,
        viewerId: VIEWER_ID,
        lastActivityAt: (5 - i) * 1_000,
        lastActivitySortKey: buildSortKey((5 - i) * 1_000, `conv_${i}`),
      }),
    );

    const result = simulateGetViewerConversations(rows, VIEWER_ID, {
      limit: 3,
    });

    expect(result.rows).toHaveLength(3);
    expect(result.continueCursor).not.toBeNull();
  });

  it("does not include anonymous conversations in the viewer inbox contract", () => {
    const VIEWER_ID = "viewer_alice";
    const rows: RawConversationRow[] = [
      makeRow({ _id: "conv_auth", viewerId: VIEWER_ID }),
      makeRow({ _id: "conv_anon_1", viewerId: null }), // anonymous
      makeRow({ _id: "conv_anon_2", viewerId: null }), // anonymous
    ];

    const result = simulateGetViewerConversations(rows, VIEWER_ID, {
      limit: 10,
    });

    const ids = result.rows.map((r) => r._id);
    expect(ids).toContain("conv_auth");
    expect(ids).not.toContain("conv_anon_1");
    expect(ids).not.toContain("conv_anon_2");
  });

  it("preserves stable ordering when two conversations share the same activity timestamp (NFR-02)", () => {
    const VIEWER_ID = "viewer_alice";
    const TS = 1_700_000_000_000;

    const rows: RawConversationRow[] = [
      makeRow({
        _id: "conv_zzz",
        viewerId: VIEWER_ID,
        lastActivityAt: TS,
        lastActivitySortKey: buildSortKey(TS, "conv_zzz"),
      }),
      makeRow({
        _id: "conv_aaa",
        viewerId: VIEWER_ID,
        lastActivityAt: TS,
        lastActivitySortKey: buildSortKey(TS, "conv_aaa"),
      }),
    ];

    const first = simulateGetViewerConversations(rows, VIEWER_ID, {
      limit: 10,
    });
    const second = simulateGetViewerConversations(rows, VIEWER_ID, {
      limit: 10,
    });

    // Order must be identical across repeated calls (deterministic tie-break)
    expect(first.rows.map((r) => r._id)).toEqual(
      second.rows.map((r) => r._id),
    );
    // zzz > aaa lexicographically so conv_zzz sorts first
    expect(first.rows[0]._id).toBe("conv_zzz");
    expect(first.rows[1]._id).toBe("conv_aaa");
  });
});
