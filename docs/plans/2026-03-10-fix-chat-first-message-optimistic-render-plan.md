---
title: "fix: Optimistic First Message Rendering in Chat Thread"
type: fix
status: active
date: 2026-03-10
origin:
  - docs/brainstorms/2026-02-28-chat-thread-brainstorm.md
  - docs/plans/2026-03-01-feat-chat-deep-link-urls-plan.md
---

# fix: Optimistic First Message Rendering in Chat Thread

## Overview

When a viewer sends the first message in Mirror chat, the thread briefly replaces the empty state with a centered loading screen before the user's bubble appears. That makes the interface feel slower than modern chat products, even when the backend is working correctly.

The goal of this fix is to make the first outbound message render immediately in the thread, then reconcile with Convex once the new conversation and streamed response are ready.

## Confirmed Root Cause

The lag comes from the interaction between new-conversation creation and the thread's loading state:

1. `sendMessage` in `apps/mirror/features/chat/hooks/use-chat.ts` waits for the Convex mutation to return a new `conversationId`.
2. `onConversationCreated` updates the URL-backed chat state via `apps/mirror/hooks/use-chat-search-params.ts` and `apps/mirror/app/[username]/_providers/chat-route-controller.tsx`.
3. Once `conversationId` exists, `useChat` starts `getConversation` and `useUIMessages`.
4. During that bootstrap window, `ChatMessageList` sees `status === "LoadingFirstPage"` and renders `ChatMessageLoadingState`.
5. Only after the first page of server messages arrives does the user bubble appear.

In the live repro, the URL updated first, the loader mounted immediately after, and the user bubble appeared about 0.8s later.

## Proposed Solution

Add optimistic local echo for the first outbound message and treat the initial server bootstrap as a reconciliation step, not a full-screen loading state.

Key principles:

- Show the submitted user message immediately on send.
- Do not replace the thread with `ChatMessageLoadingState` if an optimistic message is already available.
- Keep the current URL/deep-link model unless it still causes visible churn after optimistic rendering is in place.
- Reconcile optimistic state cleanly once the server-backed message list arrives.

## Implementation Phases

### Phase 1: Add optimistic first-message state in `useChat`

Update `apps/mirror/features/chat/hooks/use-chat.ts` to track a local optimistic outbound message for the "new conversation" path.

Tasks:

- Add local state for one pending optimistic user message and its client key.
- Set that optimistic message immediately before awaiting `sendMessageMutation`.
- Expose derived `displayMessages` and a `hasOptimisticMessage` flag from the hook.
- Keep the existing server-backed `messages` subscription as the source of truth once data arrives.

### Phase 2: Render the optimistic thread instead of the full-screen loader

Update `apps/mirror/features/chat/components/chat-message-list.tsx` to distinguish between:

- true cold load: no messages, no optimistic state
- optimistic first send: optimistic message exists while server data is still bootstrapping

Tasks:

- Preserve `ChatMessageLoadingState` only for cold entry into an existing conversation.
- If `status === "LoadingFirstPage"` but an optimistic message exists, render the normal scroll area with the optimistic user bubble.
- Ensure scroll-to-bottom still works for the optimistic message path.

### Phase 3: Reconcile optimistic and server-backed messages

Use `apps/mirror/features/chat/hooks/use-chat.ts` to clear the optimistic message once the matching server user message appears.

Tasks:

- Detect first server user message for the newly created conversation and remove the optimistic placeholder.
- Prevent duplicate user bubbles during reconciliation.
- Keep `sendAnimationKey` behavior aligned with the reconciled server message, not the temporary optimistic one.

### Phase 4: Handle failure and loading edge cases cleanly

Make sure the optimistic path fails predictably instead of leaving the thread in an ambiguous state.

Tasks:

- On mutation failure, clear the optimistic message and preserve the existing inline send error copy.
- Decide whether the failed optimistic bubble should disappear or transition into an inline failed state.
- Verify the retry flow for assistant failures still behaves as it does today.

### Phase 5: Re-evaluate URL sync priority

After optimistic rendering is in place, reassess whether the URL update still causes visible UI churn.

Tasks:

- Keep the existing `router.replace` behavior in `apps/mirror/hooks/use-chat-search-params.ts` by default.
- If needed, lower the perceived priority of the URL sync by sequencing it after optimistic state is visible or wrapping it in a transition.
- Avoid removing deep-link support unless the smaller change proves insufficient.

### Phase 6: Verify with regression coverage

Add focused verification for the first-send path.

Tasks:

- Add or extend a Playwright spec in `apps/mirror/e2e/` covering first message send in a fresh chat.
- Assert that the submitted text appears before any full-thread loading state replaces the thread.
- Verify the URL still updates with `conversation=...`.
- Run the relevant Mirror test/build commands after implementation.

## Likely Files

- `apps/mirror/features/chat/hooks/use-chat.ts`
- `apps/mirror/features/chat/components/chat-message-list.tsx`
- `apps/mirror/features/chat/components/chat-message-item.tsx`
- `apps/mirror/features/chat/components/chat-thread.tsx`
- `apps/mirror/hooks/use-chat-search-params.ts`
- `apps/mirror/e2e/` (new or updated spec)

## Acceptance Criteria

- On the first message of a fresh chat, the user's text appears in the thread immediately.
- The thread never swaps to the full-screen chat loading state after the user submits that first message.
- The conversation URL still updates correctly for deep-linking.
- Existing-conversation sends continue to work without regression.
- Mutation failure does not leave the thread stuck in a loading or duplicated state.
- Streaming assistant responses still render correctly after the optimistic first message.

## Out of Scope

- Replacing URL-backed chat routing with pure local state
- Redesigning the visual language of the chat thread
- Changing Convex streaming architecture

## References

- `docs/brainstorms/2026-02-28-chat-thread-brainstorm.md`
- `docs/plans/2026-03-01-feat-chat-deep-link-urls-plan.md`
- `apps/mirror/features/chat/hooks/use-chat.ts`
- `apps/mirror/features/chat/components/chat-message-list.tsx`
