import { describe, it, expect } from "vitest";
import {
  buildSummaryFromUserSend,
  rebuildCanonicalSummary,
  deriveBackfillSummary,
  repairStaleSummary,
  normalizePreview,
  buildSortKey,
  type MessageRecord,
} from "../conversation-summary-model";

// ---------------------------------------------------------------------------
// normalizePreview — FR-05, FR-08
// ---------------------------------------------------------------------------

describe("normalizePreview", () => {
  it("collapses internal whitespace to a single space", () => {
    expect(normalizePreview("hello   world")).toBe("hello world");
  });

  it("collapses newlines and tabs", () => {
    expect(normalizePreview("line1\n\t  line2")).toBe("line1 line2");
  });

  it("caps output at 140 characters", () => {
    const long = "a".repeat(200);
    expect(normalizePreview(long)).toHaveLength(140);
  });

  it("preview truncation collapses whitespace and caps at 140 chars", () => {
    const raw = "  " + "word ".repeat(50) + "  ";
    const result = normalizePreview(raw);
    expect(result.length).toBeLessThanOrEqual(140);
    expect(result).not.toMatch(/\s{2,}/);
  });

  it("returns empty string for blank input", () => {
    expect(normalizePreview("   ")).toBe("");
  });
});

// ---------------------------------------------------------------------------
// buildSortKey — NFR-02
// ---------------------------------------------------------------------------

describe("buildSortKey", () => {
  it("derives a deterministic sort key from timestamp and tie-breaker", () => {
    expect(buildSortKey(1_700_000_000_000, "conv_a")).toBe(
      "0001700000000000-conv_a",
    );
  });

  it("keeps ordering stable with identical timestamps (FR-05, NFR-02)", () => {
    const ts = 1_700_000_000_000;
    const keyA = buildSortKey(ts, "conv_aaa");
    const keyB = buildSortKey(ts, "conv_bbb");
    // Both are deterministic — same inputs always produce same output
    expect(buildSortKey(ts, "conv_aaa")).toBe(keyA);
    expect(buildSortKey(ts, "conv_bbb")).toBe(keyB);
    // They are distinct so ordering doesn't flap between reads
    expect(keyA).not.toBe(keyB);
  });
});

// ---------------------------------------------------------------------------
// buildSummaryFromUserSend — FR-05
// ---------------------------------------------------------------------------

describe("buildSummaryFromUserSend", () => {
  it("promotes latest user send to top of inbox ordering", () => {
    const msg: MessageRecord = {
      role: "user",
      content: "Hello there",
      createdAt: 1_700_000_001_000,
    };
    const summary = buildSummaryFromUserSend("conv_x", msg);

    expect(summary.lastActivityAt).toBe(1_700_000_001_000);
    expect(summary.lastMessageRole).toBe("user");
    expect(summary.lastMessagePreview).toBe("Hello there");
    expect(summary.lastActivitySortKey).toBe("0001700000001000-conv_x");
  });

  it("normalizes preview whitespace on user send", () => {
    const msg: MessageRecord = {
      role: "user",
      content: "  spaced   out  ",
      createdAt: 1_700_000_002_000,
    };
    const summary = buildSummaryFromUserSend("conv_y", msg);
    expect(summary.lastMessagePreview).toBe("spaced out");
  });
});

// ---------------------------------------------------------------------------
// rebuildCanonicalSummary — FR-05, FR-08
// ---------------------------------------------------------------------------

describe("rebuildCanonicalSummary", () => {
  it("rebuilds canonical preview and activity key after assistant completion", () => {
    const messages: MessageRecord[] = [
      { role: "user", content: "What is jazz?", createdAt: 1_000 },
      {
        role: "assistant",
        content: "Jazz is an improvisational music form.",
        createdAt: 2_000,
      },
    ];
    const result = rebuildCanonicalSummary("conv_jazz", messages, "assistant");

    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.summary.lastMessageRole).toBe("assistant");
    expect(result.summary.lastMessagePreview).toBe(
      "Jazz is an improvisational music form.",
    );
    expect(result.summary.lastActivityAt).toBe(2_000);
    expect(result.summary.lastActivitySortKey).toBe("0000000000002000-conv_jazz");
  });

  it("retries canonical rebuild when assistant content becomes visible after the first repair attempt", () => {
    // Only user message present — assistant hasn't landed yet
    const messages: MessageRecord[] = [
      { role: "user", content: "Still waiting...", createdAt: 5_000 },
    ];
    const result = rebuildCanonicalSummary("conv_wait", messages, "assistant");
    expect(result.status).toBe("retry");
  });

  it("returns retry when messages array is empty", () => {
    const result = rebuildCanonicalSummary("conv_empty", [], "assistant");
    expect(result.status).toBe("retry");
  });
});

// ---------------------------------------------------------------------------
// deriveBackfillSummary — FR-08
// ---------------------------------------------------------------------------

describe("deriveBackfillSummary", () => {
  it("derives deterministic summary data for backfilled pre-feature conversations", () => {
    const messages: MessageRecord[] = [
      { role: "user", content: "First message", createdAt: 100 },
      { role: "assistant", content: "First reply", createdAt: 200 },
      { role: "user", content: "Second message", createdAt: 300 },
    ];
    const summary = deriveBackfillSummary("conv_backfill", messages);

    expect(summary).not.toBeNull();
    if (!summary) return;
    expect(summary.lastMessagePreview).toBe("Second message");
    expect(summary.lastMessageRole).toBe("user");
    expect(summary.lastActivityAt).toBe(300);
    expect(summary.lastActivitySortKey).toBe("0000000000000300-conv_backfill");
  });

  it("returns null for a conversation with no messages", () => {
    expect(deriveBackfillSummary("conv_empty", [])).toBeNull();
  });

  it("is idempotent — running twice produces the same result", () => {
    const messages: MessageRecord[] = [
      { role: "assistant", content: "Only message", createdAt: 999 },
    ];
    const first = deriveBackfillSummary("conv_idem", messages);
    const second = deriveBackfillSummary("conv_idem", messages);
    expect(first).toEqual(second);
  });
});

// ---------------------------------------------------------------------------
// repairStaleSummary — FR-08
// ---------------------------------------------------------------------------

describe("repairStaleSummary", () => {
  it("repairs a stale summary when assistant content exists but summary fields are outdated", () => {
    const messages: MessageRecord[] = [
      { role: "user", content: "Old question", createdAt: 100 },
      {
        role: "assistant",
        content: "Brand new assistant reply",
        createdAt: 500,
      },
    ];
    const staleSummary = {
      lastActivityAt: 100,
      lastActivitySortKey: "100-conv_stale",
      lastMessagePreview: "Old question",
      lastMessageRole: "user" as const,
    };

    const repaired = repairStaleSummary("conv_stale", staleSummary, messages);

    expect(repaired).not.toBeNull();
    if (!repaired) return;
    expect(repaired.lastActivityAt).toBe(500);
    expect(repaired.lastMessagePreview).toBe("Brand new assistant reply");
    expect(repaired.lastMessageRole).toBe("assistant");
  });

  it("returns null when stored summary already matches canonical state", () => {
    const messages: MessageRecord[] = [
      { role: "user", content: "Hello", createdAt: 1_000 },
    ];
    const currentSummary = {
      lastActivityAt: 1_000,
      lastActivitySortKey: "1000-conv_ok",
      lastMessagePreview: "Hello",
      lastMessageRole: "user" as const,
    };

    const result = repairStaleSummary("conv_ok", currentSummary, messages);
    expect(result).toBeNull();
  });

  it("returns null when messages list is empty (nothing to repair from)", () => {
    const staleSummary = {
      lastActivityAt: 100,
      lastActivitySortKey: "100-conv_x",
      lastMessagePreview: "Old",
      lastMessageRole: "user" as const,
    };
    expect(repairStaleSummary("conv_x", staleSummary, [])).toBeNull();
  });
});
