---
id: FG_060
title: "Send animation ref stuck true on mutation failure or conversation creation"
date: 2026-03-10
type: fix
status: to-do
priority: p1
description: "In useChat, awaitingSendAnimationRef is set to true in sendMessage but never reset on mutation failure (catch branch). It also gets stuck during conversation creation when conversationId changes and messages reset. This causes stale animation triggers or permanently blocks the conversation-switch reset effect."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "grep -n 'awaitingSendAnimationRef.current = false' apps/mirror/features/chat/hooks/use-chat.ts returns matches in both the catch branch and the useLayoutEffect"
  - "The useLayoutEffect checks conversationId context to abandon stale animation detection"
  - "The conversation-switch useEffect always resets sendAnimationKey (no ref guard skip)"
  - "pnpm build --filter=@feel-good/mirror completes without errors"
owner_agent: "React state synchronization fixer"
---

# Send animation ref stuck true on mutation failure or conversation creation

## Context

Discovered during code review of `feat-rag` branch. In `apps/mirror/features/chat/hooks/use-chat.ts:67-100`, `awaitingSendAnimationRef.current` is set to `true` before the mutation call but is only reset to `false` in the `useLayoutEffect` (line 111) when a user message appears. Two failure modes:

1. **Mutation failure (line 83):** The `catch` branch resets `isSendingRef` but not `awaitingSendAnimationRef`. The ref stays `true` indefinitely. The next time `messages` updates with a user message from a previous send, the animation incorrectly triggers.

2. **Conversation creation:** When `sendMessage` creates a new conversation, `onConversationCreated` changes `conversationId`. Convex tears down the old subscription and starts a new one. Messages may arrive with the assistant message first. The ref stays `true`, and the conversation-switch reset effect (line 115) skips because of the `if (awaitingSendAnimationRef.current) return` guard.

## Goal

The animation ref is properly scoped to the conversation where the send occurred, and is always cleaned up on failure, preventing stale animation triggers.

## Scope

- Reset `awaitingSendAnimationRef` in the `catch` branch of `sendMessage`
- Add conversation context to the ref (track which conversation the send was for)
- Remove the ref guard from the conversation-switch `useEffect` so it always resets

## Out of Scope

- Adding animation key expiry (separate finding)
- Changes to mock chat hook

## Approach

Replace the simple boolean ref with a structured ref that tracks both the waiting state and the conversation it was set for. In the `useLayoutEffect`, check that the current `conversationId` matches. If not, abandon the animation detection. Remove the guard from the conversation-switch effect.

```typescript
const awaitingSendRef = useRef<{ waiting: boolean; forConversation: string | null }>({
  waiting: false,
  forConversation: null,
});
```

- **Effort:** Small
- **Risk:** Low

## Implementation Steps

1. Change `awaitingSendAnimationRef` from `useRef(false)` to `useRef({ waiting: false, forConversation: null })` in `use-chat.ts`
2. In `sendMessage`, set `{ waiting: true, forConversation: conversationId }`
3. In the `catch` branch, reset to `{ waiting: false, forConversation: null }`
4. In the `useLayoutEffect`, add a check: if `forConversation !== conversationId`, reset and return
5. Remove `if (awaitingSendAnimationRef.current) return` from the conversation-switch `useEffect`
6. Run `pnpm build --filter=@feel-good/mirror` to verify

## Constraints

- Must not change the return type of `useChat`
- The fix should not affect animation behavior in the happy path

## Resources

- Code review findings from TypeScript reviewer and frontend races reviewer
