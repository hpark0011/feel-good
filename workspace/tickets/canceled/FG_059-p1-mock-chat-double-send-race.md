---
id: FG_059
title: "Mock chat double-send race creates competing streaming intervals"
date: 2026-03-10
type: fix
status: to-do
priority: p1
description: "In useMockChat, the isStreaming guard uses React state which is stale inside the 300ms setTimeout window. Rapid double-send creates two competing setInterval instances that fight over the same message text, causing visible stutter."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "grep -n 'isStreamingRef' apps/mirror/features/chat/hooks/use-mock-chat.ts returns at least one match"
  - "grep -n 'clearTimeout' apps/mirror/features/chat/hooks/use-mock-chat.ts returns at least one match"
  - "Rapid double-send in mock chat produces only one streaming response"
  - "pnpm build --filter=@feel-good/mirror completes without errors"
owner_agent: "React hooks race condition fixer"
---

# Mock chat double-send race creates competing streaming intervals

## Context

Discovered during code review of the `feat-rag` branch. In `apps/mirror/features/chat/hooks/use-mock-chat.ts:124-137`, the `sendMessage` callback guards against double-sends using `isStreaming` state. However, `isStreaming` is captured by closure at callback creation time. The `startStreaming` function is called via `setTimeout` with a 300ms delay (line 135). During that 300ms window, `isStreaming` is still `false` because `setIsStreaming(true)` hasn't been called yet.

If a user taps send twice within 300ms, both calls pass the guard. Both schedule `setTimeout` calls. Both `startStreaming` invocations create new `setInterval` instances without clearing the previous one. Two intervals fight over `streamIndexRef` and `setMessages`, causing visual stutter.

## Goal

Mock chat's `sendMessage` prevents concurrent sends using a ref-based guard and cleans up pending timeouts, eliminating the double-send race window.

## Scope

- Replace `isStreaming` state guard with `isStreamingRef` ref guard in `sendMessage`
- Track the 300ms `setTimeout` via a ref and clear it before starting a new one
- Add defensive `clearInterval` at the start of `startStreaming`

## Out of Scope

- Simplifying the streaming simulation to remove `setInterval` entirely
- Changes to the real `useChat` hook

## Approach

Use a ref (`isStreamingRef`) that is set synchronously alongside `setIsStreaming(true)` in `startStreaming`, and checked in `sendMessage` instead of the state variable. Track the pending timeout in a ref and clear it on new sends and unmount.

- **Effort:** Small
- **Risk:** Low

## Implementation Steps

1. Add `isStreamingRef = useRef(false)` and `pendingTimeoutRef` in `useMockChat`
2. In `startStreaming`, add `clearInterval(intervalRef.current)` defensively at the top, then set `isStreamingRef.current = true` alongside `setIsStreaming(true)`. Reset both in the completion branch.
3. In `sendMessage`, replace `if (isStreaming) return` with `if (isStreamingRef.current) return`
4. Wrap the `setTimeout` call in a ref and clear any existing one first
5. Update the cleanup effect to also clear `pendingTimeoutRef.current`
6. Run `pnpm build --filter=@feel-good/mirror` to verify

## Constraints

- Must not change the public API surface of `useMockChat`
- Keep the fix minimal

## Resources

- Code review finding from frontend races reviewer
