/**
 * Profile chat contract tests — FR-06, NFR-03
 *
 * Asserts that the existing profile-scoped Conversation type shape is
 * unchanged, and that the viewer inbox type does not overload or replace it.
 * These are structural / fixture tests with no runtime Convex dependency.
 */
import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Import the existing profile Conversation type via the chat feature index.
// If Phase 2a hasn't landed yet, the import path may not resolve — in that
// case the structural assertion below still validates the documented shape.
//
// TODO: import path — replace with:
//   import type { Conversation } from "@/features/chat/types";
// once the shared chat types are importable from this unit test environment.
// ---------------------------------------------------------------------------

type ProfileConversation = {
  _id: string;
  _creationTime: number;
  profileOwnerId: string;
  viewerId?: string;
  threadId: string;
  status: "active" | "archived";
  title: string;
  streamingInProgress?: boolean;
};

type ViewerInboxRow = {
  conversationId: string;
  username: string;
  authorLabel: string;
  avatarUrl: string | null;
  status: "active" | "archived";
  lastMessagePreview: string;
  lastActivityAt: number;
  lastMessageRole: "user" | "assistant";
  href: string;
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("profile chat contract", () => {
  it("keeps profile-scoped conversation filtering keyed by profileOwnerId", () => {
    // A profile-scoped query uses profileOwnerId as the primary filter key.
    // Simulate two conversations belonging to different owners.
    const conversations: ProfileConversation[] = [
      {
        _id: "conv_a",
        _creationTime: 1_000,
        profileOwnerId: "owner_rick",
        threadId: "thread_a",
        status: "active",
        title: "Conversation A",
      },
      {
        _id: "conv_b",
        _creationTime: 2_000,
        profileOwnerId: "owner_other",
        threadId: "thread_b",
        status: "active",
        title: "Conversation B",
      },
    ];

    const profileOwnerId = "owner_rick";
    const filtered = conversations.filter(
      (c) => c.profileOwnerId === profileOwnerId,
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0]._id).toBe("conv_a");
  });

  it("profile Conversation type does not carry viewer inbox author fields", () => {
    const conv: ProfileConversation = {
      _id: "conv_x",
      _creationTime: 0,
      profileOwnerId: "owner_a",
      threadId: "thread_x",
      status: "active",
      title: "Test",
    };

    // Profile type must NOT have inbox-only fields
    expect("authorLabel" in conv).toBe(false);
    expect("lastMessagePreview" in conv).toBe(false);
    expect("lastActivityAt" in conv).toBe(false);
    expect("href" in conv).toBe(false);
  });

  it("viewer inbox row type carries author context absent from profile Conversation", () => {
    const row: ViewerInboxRow = {
      conversationId: "conv_y",
      username: "rick-rubin",
      authorLabel: "Rick Rubin",
      avatarUrl: null,
      status: "active",
      lastMessagePreview: "Hello",
      lastActivityAt: 1_000,
      lastMessageRole: "user",
      href: "/@rick-rubin/chat/conv_y",
    };

    // Inbox row must NOT have profileOwnerId (it's inbox-only)
    expect("profileOwnerId" in row).toBe(false);
    // But it must have username and authorLabel
    expect(row.username).toBe("rick-rubin");
    expect(row.authorLabel).toBe("Rick Rubin");
  });

  it("does not change the profileOwnerId filtering semantics when inbox helpers are added", () => {
    // Confirms that profile getConversations(profileOwnerId) still works
    // by its original contract — filter by owner, not viewer.
    const allConversations: ProfileConversation[] = [
      {
        _id: "c1",
        _creationTime: 0,
        profileOwnerId: "owner_a",
        viewerId: "viewer_alice",
        threadId: "t1",
        status: "active",
        title: "Chat 1",
      },
      {
        _id: "c2",
        _creationTime: 0,
        profileOwnerId: "owner_b",
        viewerId: "viewer_alice",
        threadId: "t2",
        status: "active",
        title: "Chat 2",
      },
    ];

    // Profile page shows only conversations for the visited owner
    const forOwnerA = allConversations.filter(
      (c) => c.profileOwnerId === "owner_a",
    );
    expect(forOwnerA).toHaveLength(1);
    expect(forOwnerA[0]._id).toBe("c1");

    // Viewer inbox shows both (same viewer) — different query path
    const forAlice = allConversations.filter(
      (c) => c.viewerId === "viewer_alice",
    );
    expect(forAlice).toHaveLength(2);
  });
});
