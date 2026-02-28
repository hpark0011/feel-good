---
title: "feat: Chat Thread with Digital Clone"
type: feat
status: active
date: 2026-02-28
origin: docs/brainstorms/2026-02-28-chat-thread-brainstorm.md
---

# feat: Chat Thread with Digital Clone

## Overview

Add a real-time chat thread to Mirror's profile page that lets viewers converse with an LLM-powered digital clone of the profile owner. When a viewer sends their first message, the left profile panel transitions (collapse + reveal) into a chat interface with streaming responses, conversation persistence, and a conversation list sidebar.

## Problem Statement / Motivation

Mirror turns blog articles into interactive experiences. Currently, readers can only passively consume articles. A chat clone bridges the gap — readers can ask questions, get personalized answers grounded in the author's writing, and engage in dialogue. This transforms a static profile into a living, conversational presence.

## Proposed Solution

Build a `features/chat/` module (following the `features/video-call/` pattern) with:
- **Convex backend**: `conversations` + `messages` tables, an LLM streaming action using `@convex-dev/agent`, and rate limiting via `@convex-dev/rate-limiter`
- **React frontend**: chat thread UI with streaming message rendering, conversation list, and a compact chat header
- **Profile shell integration**: `activeView: "profile" | "chat"` state replaces `chatOpen` boolean, with framer-motion collapse + reveal transition

(see brainstorm: `docs/brainstorms/2026-02-28-chat-thread-brainstorm.md`)

## Technical Approach

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│ Profile Shell (orchestrator)                                │
│   activeView: "profile" | "chat"                            │
│   ┌──────────────┐  ┌──────────────────────────────────┐    │
│   │ ProfileInfo   │  │ ChatThread (features/chat/)      │    │
│   │ (profile view)│  │  ├─ ChatHeader                   │    │
│   │               │◄─┤  ├─ ChatMessageList              │    │
│   │ Profile       │  │  ├─ ConversationList (sidebar)   │    │
│   │ ChatInput     │  │  └─ ChatInput                    │    │
│   │ (trigger)     │  │                                  │    │
│   └──────────────┘  └──────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
         │                        │
         ▼                        ▼
┌─────────────────────────────────────────────────────────────┐
│ Convex Backend (packages/convex/)                           │
│  ├─ chat/schema.ts (conversations, messages tables)         │
│  ├─ chat/mutations.ts (sendMessage, createConversation)     │
│  ├─ chat/queries.ts (getMessages, getConversations)         │
│  ├─ chat/actions.ts (streamResponse via @convex-dev/agent)  │
│  └─ chat/agent.ts (Agent definition, persona builder)       │
│  users/schema.ts += personaPrompt, chatAuthRequired         │
└─────────────────────────────────────────────────────────────┘
```

### Data Model (ERD)

```mermaid
erDiagram
    users {
        Id _id PK
        string authId
        string email
        string username
        string name
        string bio
        Id avatarStorageId FK
        boolean onboardingComplete
        string personaPrompt "NEW - custom clone persona"
        boolean chatAuthRequired "NEW - auth gate config"
    }
    conversations {
        Id _id PK
        Id profileOwnerId FK
        Id viewerId FK "nullable for anonymous"
        string status "active | archived"
        string title "first message snippet"
    }
    messages {
        Id _id PK
        Id conversationId FK
        string role "user | assistant"
        string content
        string status "complete | streaming | error | superseded"
    }
    users ||--o{ conversations : "profileOwnerId"
    users ||--o{ conversations : "viewerId"
    conversations ||--o{ messages : "conversationId"
```

**Indexes:**
- `conversations`: `by_profileOwnerId_and_viewerId` (`["profileOwnerId", "viewerId"]`), `by_viewerId` (`["viewerId"]`)
- `messages`: `by_conversationId` (`["conversationId"]`)

### Streaming Mechanism (Updated from Brainstorm)

The brainstorm proposed manual `ctx.db.patch` from actions, but **actions cannot access `ctx.db`** (per `.claude/rules/convex.md`). The correct pattern uses `@convex-dev/agent`:

1. **Mutation** saves user message + schedules action via `ctx.scheduler.runAfter(0, ...)`
2. **Action** uses `@convex-dev/agent`'s `Agent.streamText()` with `saveStreamDeltas: { throttleMs: 100 }`
3. **Client** subscribes via `useUIMessages` hook (from `@convex-dev/agent/react`) with `stream: true`
4. Delta batching is handled by the agent library (not per-token mutations)

This resolves the brainstorm's crash hazard concern — `@convex-dev/agent` handles cleanup internally.

### Implementation Phases

#### Phase 1: Foundation — Schema + Dependencies

**Goal:** Database tables and packages ready for backend development.

**Tasks:**
- [ ] Install `@convex-dev/agent` and `@convex-dev/rate-limiter` in `packages/convex/`
- [ ] Register both components in `packages/convex/convex/convex.config.ts`
- [ ] Add `personaPrompt` and `chatAuthRequired` fields to `packages/convex/convex/users/schema.ts`
- [ ] Create `packages/convex/convex/chat/schema.ts` with `conversations` and `messages` tables
- [ ] Register new tables in `packages/convex/convex/schema.ts`
- [ ] Run `pnpm exec convex codegen` to generate types
- [ ] Verify with `pnpm build`

**Files:**
- `packages/convex/package.json` (add deps)
- `packages/convex/convex/convex.config.ts` (new file — register agent + rate-limiter components)
- `packages/convex/convex/users/schema.ts` (add fields)
- `packages/convex/convex/chat/schema.ts` (new file)
- `packages/convex/convex/schema.ts` (import chat tables)

<details>
<summary>packages/convex/convex/chat/schema.ts (pseudo)</summary>

```typescript
import { defineTable } from "convex/server";
import { v } from "convex/values";

export const conversationFields = {
  profileOwnerId: v.id("users"),
  viewerId: v.optional(v.id("users")),
  status: v.union(v.literal("active"), v.literal("archived")),
  title: v.string(),
};

export const conversationsTable = defineTable(conversationFields)
  .index("by_profileOwnerId_and_viewerId", ["profileOwnerId", "viewerId"])
  .index("by_viewerId", ["viewerId"]);

export const messageFields = {
  conversationId: v.id("conversations"),
  role: v.union(v.literal("user"), v.literal("assistant")),
  content: v.string(),
  status: v.union(
    v.literal("complete"),
    v.literal("streaming"),
    v.literal("error"),
    v.literal("superseded"), // retry lifecycle: marks errored messages replaced by a fresh retry
  ),
};

export const messagesTable = defineTable(messageFields)
  .index("by_conversationId", ["conversationId"]);
```

</details>

---

#### Phase 2: Backend — Convex Functions + Agent

**Goal:** Working chat backend with LLM streaming.

**Tasks:**
- [ ] Create `packages/convex/convex/chat/agent.ts` — define the Agent with provider-agnostic LLM config
- [ ] Create `packages/convex/convex/chat/mutations.ts` — `sendMessage` (regular mutation with optional auth via `safeGetAuthUser`, creates conversation if needed, inserts user message, schedules LLM action, enforces rate limit), `createConversation`
- [ ] Create `packages/convex/convex/chat/actions.ts` — `streamResponse` (internal action, uses Agent.streamText with saveStreamDeltas)
- [ ] Create `packages/convex/convex/chat/queries.ts` — `getMessages` (paginated, with stream args; access control: requesting user must be viewer or profile owner), `getConversations` (by viewerId + profileOwnerId; viewer sees only own conversations, owner sees all on their profile)
- [ ] Create `packages/convex/convex/chat/helpers.ts` — persona prompt builder (articles + bio + custom prompt)
- [ ] Set up rate limiter in `packages/convex/convex/chat/rateLimits.ts`
- [ ] Add input validation in `sendMessage` (empty/oversized content rejection — empty after trim or >4000 chars)
- [ ] Add concurrency guard in `sendMessage` (reject if any message has `status: "streaming"` in conversation)
- [ ] Add context windowing in `loadPersonaContext` (`MAX_CONTEXT_MESSAGES = 20`, exclude `error`/`superseded` messages)
- [ ] Add safety prefix to system prompt in `helpers.ts` (non-negotiable clone identity boundaries, prepended before `personaPrompt`)
- [ ] Add stale-stream cleanup cron in `packages/convex/convex/crons.ts`
- [ ] Verify with `pnpm exec convex dev` (functions deploy successfully)

**Files:**
- `packages/convex/convex/chat/agent.ts` (new)
- `packages/convex/convex/chat/mutations.ts` (new)
- `packages/convex/convex/chat/actions.ts` (new — `"use node"`)
- `packages/convex/convex/chat/queries.ts` (new)
- `packages/convex/convex/chat/helpers.ts` (new)
- `packages/convex/convex/chat/rateLimits.ts` (new)
- `packages/convex/convex/crons.ts` (new or update existing)

<details>
<summary>Mutation pattern (sendMessage pseudo)</summary>

```typescript
// packages/convex/convex/chat/mutations.ts
import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";
import { internal } from "../_generated/api";
import { rateLimiter } from "./rateLimits";
import { authComponent } from "../lib/auth";

export const sendMessage = mutation({
  args: {
    profileOwnerId: v.id("users"),
    conversationId: v.optional(v.id("conversations")),
    content: v.string(),
  },
  returns: v.object({
    conversationId: v.id("conversations"),
    messageId: v.id("messages"),
  }),
  handler: async (ctx, args) => {
    // --- Input validation ---
    const trimmed = args.content.trim();
    if (trimmed.length === 0) throw new ConvexError("Message cannot be empty");
    if (args.content.length > 4000) throw new ConvexError("Message too long");

    // --- Optional auth (supports anonymous chat) ---
    const authUser = await authComponent.safeGetAuthUser(ctx);
    const profileOwner = await ctx.db.get(args.profileOwnerId);
    if (!profileOwner) throw new ConvexError("Profile not found");
    if (profileOwner.chatAuthRequired && !authUser) {
      throw new ConvexError("Sign in required");
    }

    // --- Rate limit (keyed by userId or conversationId for anonymous) ---
    const rateLimitKey = authUser?._id ?? args.conversationId ?? "anonymous";
    await rateLimiter.limit(ctx, "sendMessage", {
      key: rateLimitKey,
      throws: true,
    });

    // --- Concurrency guard ---
    if (args.conversationId) {
      const streaming = await ctx.db
        .query("messages")
        .withIndex("by_conversationId", (q) =>
          q.eq("conversationId", args.conversationId!),
        )
        .filter((q) => q.eq(q.field("status"), "streaming"))
        .first();
      if (streaming) throw new ConvexError("A response is already in progress");
    }

    // --- Create conversation if first message ---
    let conversationId = args.conversationId;
    if (!conversationId) {
      conversationId = await ctx.db.insert("conversations", {
        profileOwnerId: args.profileOwnerId,
        viewerId: authUser?._id, // undefined for anonymous
        status: "active" as const,
        title: trimmed.slice(0, 100),
      });
    }

    // --- Insert user message ---
    const messageId = await ctx.db.insert("messages", {
      conversationId,
      role: "user" as const,
      content: trimmed,
      status: "complete" as const,
    });

    // --- Schedule LLM response ---
    await ctx.scheduler.runAfter(0, internal.chat.actions.streamResponse, {
      conversationId,
      profileOwnerId: args.profileOwnerId,
    });

    return { conversationId, messageId };
  },
});
```

</details>

<details>
<summary>Agent + streaming action (pseudo)</summary>

```typescript
// packages/convex/convex/chat/agent.ts
import { Agent } from "@convex-dev/agent";
import { components } from "../_generated/api";

// Provider-agnostic: swap the model import based on env config
export const cloneAgent = new Agent(components.agent, {
  instructions: "", // overridden per-call with persona context
  // languageModel configured at call time or via env
});

// packages/convex/convex/chat/actions.ts
"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { cloneAgent } from "./agent";
import { internal } from "../_generated/api";

export const streamResponse = internalAction({
  args: {
    conversationId: v.id("conversations"),
    profileOwnerId: v.id("users"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // Load persona context (articles, bio, persona prompt)
    const context = await ctx.runQuery(
      internal.chat.queries.loadPersonaContext,
      { profileOwnerId: args.profileOwnerId },
    );

    // Stream with batched delta writes (100ms throttle)
    await cloneAgent.streamText(
      ctx,
      { threadId: args.conversationId },
      { prompt: context.recentMessages },
      {
        systemPrompt: context.systemPrompt,
        saveStreamDeltas: { throttleMs: 100 },
      },
    );

    return null;
  },
});
```

</details>

---

#### Phase 3: Frontend — Chat Feature Module

**Goal:** Self-contained `features/chat/` module with all UI components.

**Tasks:**
- [ ] Create `apps/mirror/features/chat/types.ts` — ChatMessage, Conversation, ChatState types
- [ ] Create `apps/mirror/features/chat/context/chat-context.tsx` — ChatProvider wrapping conversation state + messages subscription
- [ ] Create `apps/mirror/features/chat/hooks/use-chat.ts` — send message mutation, subscribe to streaming via `useUIMessages`
- [ ] Create `apps/mirror/features/chat/hooks/use-conversations.ts` — list/create/switch conversations
- [ ] Create `apps/mirror/features/chat/components/chat-header.tsx` — compact header (Back, avatar+name, + button)
- [ ] Create `apps/mirror/features/chat/components/chat-message.tsx` — message bubble (user = blue right-aligned, assistant = white left-aligned with avatar)
- [ ] Create `apps/mirror/features/chat/components/chat-message-list.tsx` — scrollable message list with auto-scroll on new messages
- [ ] Create `apps/mirror/features/chat/components/chat-input.tsx` — in-thread input (uses `use-chat` send, distinct from profile trigger input)
- [ ] Create `apps/mirror/features/chat/components/chat-thread.tsx` — main container composing header + message list + input
- [ ] Create `apps/mirror/features/chat/components/conversation-list.tsx` — sidebar/sheet listing past conversations
- [ ] Create `apps/mirror/features/chat/index.ts` — barrel exports
- [ ] Add privacy disclosure in `ChatInput`: show "Conversations may be visible to [profile owner name]" below the chat input
- [ ] Verify with `pnpm build --filter=@feel-good/mirror`

**Files:** All under `apps/mirror/features/chat/` (new directory)

**Component props design:**
- `ChatThread` accepts `profileOwnerId: Id<"users">`, `profileName: string`, `avatarUrl: string | null`, `onBack: () => void` — no `Profile` type dependency
- `ChatHeader` accepts `profileName`, `avatarUrl`, `onBack`, `onNewConversation`
- `ChatMessage` accepts `role`, `content`, `status`, `avatarUrl` (for assistant)
- `ConversationList` accepts `conversations`, `activeConversationId`, `onSelect`

---

#### Phase 4: Profile Shell Integration — View Transition

**Goal:** Smooth transition between profile and chat views on both desktop and mobile.

**Tasks:**
- [ ] Modify `apps/mirror/app/[username]/_components/profile-shell.tsx`:
  - Replace `chatOpen: boolean` with `activeView: "profile" | "chat"` + `activeConversationId: Id<"conversations"> | null`
  - Profile `ChatInput` gets `onSend` callback that creates conversation + transitions view
  - Desktop: AnimatePresence switches between ProfileInfo and ChatThread in left panel
  - Mobile: When `activeView === "chat"`, bypass `MobileProfileLayout` entirely and render full-screen ChatThread
- [ ] Update `apps/mirror/features/profile/components/chat-input.tsx` — add `onSend?: (message: string) => void` prop, call it from `handleSend` instead of just clearing
- [ ] Implement collapse + reveal framer-motion transition (profile content → compact chat header)
- [ ] Wire "Back" button to set `activeView = "profile"` and keep `activeConversationId` so re-opening resumes
- [ ] Wire "+" button to create new conversation via `use-conversations`
- [ ] Verify desktop transition visually
- [ ] Verify mobile full-screen takeover

**Files:**
- `apps/mirror/app/[username]/_components/profile-shell.tsx` (modify)
- `apps/mirror/features/profile/components/chat-input.tsx` (modify — add `onSend` prop)
- `apps/mirror/features/profile/index.ts` (no change needed — ChatInput already exported)

<details>
<summary>Profile shell state changes (pseudo)</summary>

```typescript
// Replace:
const [chatOpen, setChatOpen] = useState(false);

// With:
const [activeView, setActiveView] = useState<"profile" | "chat">("profile");
const [activeConversationId, setActiveConversationId] =
  useState<Id<"conversations"> | null>(null);

// Profile ChatInput onSend:
const handleFirstMessage = async (message: string) => {
  const { conversationId } = await sendMessage({
    profileOwnerId: profile._id,
    content: message,
  });
  setActiveConversationId(conversationId);
  setActiveView("chat");
};

// ChatThread onBack:
const handleBackToProfile = () => {
  setActiveView("profile");
  // Keep activeConversationId so re-opening resumes
};
```

</details>

---

#### Phase 5: Polish — Auth Gate, Rate Limits, Error States

**Goal:** Production-ready edge cases and error handling.

**Tasks:**
- [ ] Implement auth gate in profile ChatInput: if `chatAuthRequired && !isAuthenticated`, show sign-in prompt on send attempt
- [ ] Add rate limit error handling in ChatInput: catch `ConvexError` from rate limiter, show inline "Rate limit reached" message with retry timer
- [ ] Add error state UI for failed streaming messages (error indicator + retry button below partial content; superseded messages hidden)
- [ ] Add retry handler: mark errored assistant message `status: "superseded"`, create fresh assistant message, re-schedule `streamResponse` action. `loadPersonaContext` excludes `error` and `superseded` messages from LLM context
- [ ] Disable send button while any message in conversation has `status: "streaming"`
- [ ] Add stale-stream cleanup cron (messages in `"streaming"` for >2 minutes → mark `"error"`)
- [ ] Add empty state for ChatThread (no messages yet — show welcome prompt)
- [ ] Add default system prompt fallback when `personaPrompt` is null
- [ ] Test end-to-end: send message → stream response → conversation persists → page refresh resumes

**Files:**
- `apps/mirror/features/chat/components/chat-message.tsx` (error state UI)
- `apps/mirror/features/chat/hooks/use-chat.ts` (error handling, retry)
- `apps/mirror/features/profile/components/chat-input.tsx` (auth gate)
- `packages/convex/convex/chat/helpers.ts` (default system prompt)
- `packages/convex/convex/crons.ts` (stale cleanup)

## Alternative Approaches Considered

| Approach | Why Rejected |
|----------|-------------|
| **B: Chat as Profile Sub-feature** | Bloats profile feature with chat concerns; profile context becomes heavy (see brainstorm) |
| **C: Hybrid — shared backend, profile-hosted UI** | Blurry feature boundary; chat UI in profile creates wrong-direction cross-feature dependency |
| **Manual `db.patch` streaming** | Actions cannot use `ctx.db`; per-token `ctx.runMutation` is too expensive (~50ms each). `@convex-dev/agent` handles batched delta writes correctly |
| **HTTP streaming via `httpAction` + SSE** | Bypasses Convex real-time subscription model; requires separate auth handling. `@convex-dev/agent` delta streaming is the Convex-native approach |

## System-Wide Impact

### Interaction Graph

```
User sends message (UI)
  → Profile ChatInput.onSend(message)
  → Convex mutation: chat.mutations.sendMessage
    → safeGetAuthUser() — resolve viewer (optional for anonymous)
    → input validation — reject empty or oversized content
    → rateLimiter.limit() — enforces rate limit (keyed by userId or conversationId)
    → concurrency guard — reject if any message is streaming
    → ctx.db.insert("conversations") — if first message
    → ctx.db.insert("messages") — user message (status: "complete")
    → ctx.scheduler.runAfter(0, internal.chat.actions.streamResponse)
      → Agent.streamText() — calls LLM API
        → DeltaStreamer batches tokens → ctx.runMutation every ~100ms
        → messages table updated with streaming content
  → Client useUIMessages subscription receives real-time delta updates
  → ChatMessageList re-renders with progressive token display
```

### Error Propagation

- **Rate limit error**: `ConvexError` from `@convex-dev/rate-limiter` → caught by `useMutation` error handler → displayed inline in chat UI
- **LLM API error**: Caught in action handler → message status patched to `"error"` → client sees error state on message bubble
- **Action crash (unhandled)**: Message stays `"streaming"` → cron job detects after 2 minutes → patches to `"error"`
- **Auth error**: `sendMessage` checks `chatAuthRequired` — if profile owner requires auth and no user is signed in, throws `ConvexError("Sign in required")` → caught in `onSend` → redirect to `/sign-in?next=/@username`. Anonymous users are allowed when `chatAuthRequired` is false.
- **Input validation error**: `ConvexError("Message cannot be empty")` or `ConvexError("Message too long")` → caught in `onSend` → displayed inline
- **Concurrency error**: `ConvexError("A response is already in progress")` → caught in `onSend` → send button remains disabled
- **Network disconnect**: Convex client auto-reconnects; `useUIMessages` re-syncs from persisted state

### State Lifecycle Risks

- **Partial message on crash**: Partial `content` preserved with `status: "error"`. UI shows partial text + error indicator.
- **Orphaned conversation**: If mutation creates conversation but action scheduling fails, conversation exists with no messages. Harmless — user can send another message.
- **Stale streaming**: Cron-based cleanup (2-minute threshold) prevents permanent spinner.

### API Surface Parity

- All chat functions are new — no existing interfaces to update
- Profile `ChatInput` gains an `onSend` prop but remains backward-compatible (prop is optional)

## Acceptance Criteria

### Functional Requirements

- [ ] Viewer can type and send a message on any profile page
- [ ] First message creates a conversation and transitions profile panel to chat thread (collapse + reveal animation)
- [ ] Clone responds with streaming tokens that appear progressively
- [ ] Messages persist — refreshing the page and re-opening chat shows conversation history
- [ ] "+" button creates a new conversation; previous conversations accessible in conversation list
- [ ] "Back" button returns to profile view; re-opening chat resumes the last conversation
- [ ] Conversation list sidebar shows past conversations with title (first message snippet)
- [ ] Clone context includes profile owner's articles, bio, and custom persona prompt
- [ ] Profile owner can set `chatAuthRequired` to gate anonymous chatting
- [ ] Rate limiting prevents message spam (enforced server-side)
- [ ] Streaming errors show error state with retry button
- [ ] Mobile: chat takes over full screen; Back returns to profile

### Non-Functional Requirements

- [ ] Streaming tokens appear within 500ms of send (excluding LLM latency)
- [ ] Messages render without layout shift during streaming
- [ ] Rate limiter does not block normal conversation pace (10 messages/minute baseline)
- [ ] No `Profile` type imported in `features/chat/` — clean module boundary

### Quality Gates

- [ ] `pnpm build` passes (all apps)
- [ ] `pnpm lint` passes
- [ ] Desktop and mobile transitions verified visually
- [ ] End-to-end flow verified: send → stream → persist → refresh → resume

## Dependencies & Prerequisites

| Dependency | Status | Notes |
|-----------|--------|-------|
| `@convex-dev/agent` | To install | Handles streaming delta writes to Convex |
| `@convex-dev/rate-limiter` | To install | Token bucket rate limiting |
| LLM API key | Required | Environment variable for chosen provider (Claude/OpenAI) |
| Convex deployment | Existing | Schema push needed after table creation |
| `framer-motion` | Already installed | Used for collapse + reveal transition |

## Risk Analysis & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| `@convex-dev/agent` API mismatch with current Convex version | Medium | High | Pin version; verify compatibility before Phase 1 |
| LLM response quality with articles as context | Low | Medium | Default system prompt provides guardrails; owner can customize |
| Streaming latency on slow LLM providers | Medium | Medium | Show typing indicator immediately; batch delta writes at 100ms |
| Rate limiter too aggressive for normal use | Low | Low | Token bucket with burst capacity; configurable per-profile later |
| Mobile keyboard layout issues | Medium | Medium | Use `env(safe-area-inset-bottom)` and `scrollIntoView` for input |
| Prompt injection / clone reputation damage | Medium | High | Safety prefix prepended to all system prompts with non-negotiable identity boundaries; input moderation deferred to future consideration |
| Context window overflow on long conversations | High | High | Sliding window of last 20 messages (`MAX_CONTEXT_MESSAGES`); `error`/`superseded` messages excluded from context |
| Anonymous abuse without auth gate | Medium | Medium | Rate limiting keyed by `conversationId` for anonymous users; profile owners can enable `chatAuthRequired` to gate all chat |

## Resolved Design Questions

(Carried forward from brainstorm — see `docs/brainstorms/2026-02-28-chat-thread-brainstorm.md`)

| Question | Resolution | Default Assumption |
|----------|-----------|-------------------|
| Auth gate trigger point | Gate fires on send attempt (not on button click) | Typed message is not preserved through redirect |
| Anonymous viewer identity | IP-based rate limiting for anonymous; no conversation persistence across reloads | Can be upgraded to anonymous session tokens later |
| Can owner chat with own clone? | Yes — useful for testing persona | `viewerId === profileOwnerId` in conversations table |
| Mid-stream interruption | Send button disabled while any message is streaming | Simplest correct behavior |
| Conversation list on desktop | Slide-in sheet from left edge of chat panel, toggled by icon in ChatHeader | Not a third panel |
| Conversation list on mobile | History icon in ChatHeader opens bottom sheet listing past conversations | Reuses familiar mobile pattern |
| Chat view persistence across navigation | Does not persist — navigating to article and back resets to profile view | Conversation is preserved in Convex and accessible via conversation list |
| Partial content on error | Shown alongside error indicator | More informative than clearing |
| Default system prompt | Hardcoded fallback when personaPrompt is null | "You are a digital clone of [name]. Answer based on their writing." |
| Stale stream cleanup | Cron runs every 5 minutes; messages streaming >2 minutes → "error" | Conservative threshold |
| Drawer snap point on mobile back | Resets to PEEK_SNAP_POINT (default) | Acceptable; user can re-expand |
| Conversation transcript privacy | Profile owner can read all conversations on their profile; viewer can only read their own conversations; others get no access | `getMessages` checks requesting user is viewer or owner |
| Retry behavior on LLM error | Errored assistant message marked `"superseded"` (hidden in UI); fresh assistant message created + new `streamResponse` scheduled | `loadPersonaContext` excludes `error` and `superseded` from LLM context |
| Anonymous rate limiting | Keyed by `conversationId` (anonymous users can only spam within one conversation) | Authenticated users keyed by `userId` |
| Input validation limits | Max 4000 characters; empty (after trim) rejected | `ConvexError` thrown server-side |
| Context window strategy | Sliding window of last 20 messages (`MAX_CONTEXT_MESSAGES` constant in `helpers.ts`) | `error`/`superseded` messages excluded before windowing |

## Future Considerations

- **Persona prompt editor UI** — settings page section for profile owners (not in this plan scope)
- **Deep-link URLs** — `/@username/chat/[conversationId]` for sharing/bookmarking conversations
- **Conversation archival** — manual or time-based archival of old conversations
- **Multi-provider switching** — UI for owner to choose their clone's LLM provider
- **Anonymous session tokens** — server-issued tokens for anonymous visitor conversation persistence
- **Voice chat** — extend to voice input/output using existing Tavus CVI infrastructure
- **Input moderation** — OpenAI Moderation API or equivalent pre-screening before LLM call to filter harmful/abusive input

## Sources & References

### Origin

- **Brainstorm document:** [docs/brainstorms/2026-02-28-chat-thread-brainstorm.md](docs/brainstorms/2026-02-28-chat-thread-brainstorm.md) — Key decisions carried forward: separate `features/chat/` module, provider-agnostic LLM, Convex persistence, collapse + reveal transition, configurable auth

### Internal References

- Profile shell: `apps/mirror/app/[username]/_components/profile-shell.tsx` (integration point)
- Profile chat input: `apps/mirror/features/profile/components/chat-input.tsx` (trigger input)
- Video-call feature pattern: `apps/mirror/features/video-call/` (module structure template)
- Convex auth helpers: `packages/convex/convex/lib/auth.ts` (authMutation/authQuery)
- Users schema: `packages/convex/convex/users/schema.ts` (add new fields)
- Convex rules: `.claude/rules/convex.md` (function guidelines)
- Provider separation pattern: `docs/solutions/architecture-patterns/provider-separation-of-concerns.md`

### External References

- Convex Agent streaming docs: https://docs.convex.dev/agents/streaming
- Convex Agent getting started: https://docs.convex.dev/agents/getting-started
- `@convex-dev/rate-limiter`: https://github.com/get-convex/rate-limiter
