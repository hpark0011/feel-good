import { describe, it, expect } from "vitest";
import {
  mapViewerInboxRow,
  type ViewerInboxRowInput,
} from "../viewer-inbox-row-model";

// ---------------------------------------------------------------------------
// mapViewerInboxRow — FR-03
// ---------------------------------------------------------------------------

const BASE_INPUT: ViewerInboxRowInput = {
  conversationId: "conv_abc",
  username: "rick-rubin",
  displayName: "Rick Rubin",
  avatarUrl: "https://cdn.example.com/avatars/rick.jpg",
  status: "active",
  lastMessagePreview: "Hey, what do you think of my track?",
  lastActivityAt: 1_700_000_000_000,
  lastMessageRole: "user",
};

describe("mapViewerInboxRow", () => {
  it("maps author name, username, avatar, status, and preview into a renderable inbox row", () => {
    const row = mapViewerInboxRow(BASE_INPUT);

    expect(row.conversationId).toBe("conv_abc");
    expect(row.username).toBe("rick-rubin");
    expect(row.authorLabel).toBe("Rick Rubin");
    expect(row.avatarUrl).toBe("https://cdn.example.com/avatars/rick.jpg");
    expect(row.status).toBe("active");
    expect(row.lastMessagePreview).toBe("Hey, what do you think of my track?");
    expect(row.lastActivityAt).toBe(1_700_000_000_000);
    expect(row.lastMessageRole).toBe("user");
  });

  it("falls back to @username when author display name is missing", () => {
    const input: ViewerInboxRowInput = { ...BASE_INPUT, displayName: null };
    const row = mapViewerInboxRow(input);
    expect(row.authorLabel).toBe("@rick-rubin");
  });

  it("generates the correct href with /@username/chat/conversationId", () => {
    const row = mapViewerInboxRow(BASE_INPUT);
    expect(row.href).toBe("/@rick-rubin/chat/conv_abc");
  });

  it("preserves archived status", () => {
    const row = mapViewerInboxRow({ ...BASE_INPUT, status: "archived" });
    expect(row.status).toBe("archived");
  });

  it("includes assistant message role when last message was assistant", () => {
    const row = mapViewerInboxRow({
      ...BASE_INPUT,
      lastMessageRole: "assistant",
    });
    expect(row.lastMessageRole).toBe("assistant");
  });

  it("allows null avatarUrl", () => {
    const row = mapViewerInboxRow({ ...BASE_INPUT, avatarUrl: null });
    expect(row.avatarUrl).toBeNull();
  });
});
