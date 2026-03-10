---
id: FG_063
title: "Mock chat uses module-level mutable counter with divergent id and key"
date: 2026-03-10
type: fix
status: to-do
priority: p2
description: "useMockChat has a module-level let mockKeyCounter that persists across navigations and Strict Mode. createUserMessage calls nextKey twice producing different values for id and key on the same message. The sendMessage callback also closes over stale messages.length."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "grep -rn 'let mockKeyCounter' apps/mirror/features/chat/hooks/use-mock-chat.ts returns zero matches"
  - "In createUserMessage the id and key fields use the same value"
  - "sendMessage does not depend on messages.length in its useCallback dependency array"
  - "pnpm build --filter=@feel-good/mirror completes without errors"
owner_agent: "React state management fixer"
---

# Mock chat uses module-level mutable counter with divergent id and key

## Context

Discovered during code review of `feat-rag` branch. In `apps/mirror/features/chat/hooks/use-mock-chat.ts:23-26`, `let mockKeyCounter = 100` is module-scoped mutable state. It persists across component unmount/remount cycles, navigations within the SPA, React Strict Mode double-renders, and HMR.

Additionally, `createUserMessage` (line 28) calls `nextKey()` twice producing different values for `id` and `key` on the same message. This contradicts the pattern in `mock-chat-data.ts` where `mockMessage` sets `id: overrides.key` (same value).

The `sendMessage` callback (line 127) also closes over `messages.length` which defeats `useCallback` memoization since it recreates on every message change.

## Goal

Mock key generation is instance-scoped or uses crypto.randomUUID, id and key are consistent per message, and sendMessage derives order from the functional updater.

## Scope

- Replace module-level counter with `crypto.randomUUID()`
- Fix `createUserMessage` to use the same value for `id` and `key`
- Use functional updater in `sendMessage` to derive `nextOrder` from `prev.length`

## Out of Scope

- Simplifying the streaming simulation
- Removing mock retry or error state

## Approach

Replace `nextKey()` with `crypto.randomUUID()` (simplest, no refs needed). Call it once per message and use for both `id` and `key`. Use the functional updater pattern in `sendMessage`.

- **Effort:** Small
- **Risk:** Low

## Implementation Steps

1. Remove `let mockKeyCounter` and `function nextKey()` from `use-mock-chat.ts`
2. In `createUserMessage` and `createStreamingMessage`, generate one key via `crypto.randomUUID()` and use for both `id` and `key`
3. In `sendMessage`, move message creation inside `setMessages(prev => ...)` to derive `nextOrder` from `prev.length`
4. Remove `messages.length` from the `useCallback` dependency array
5. Run `pnpm build --filter=@feel-good/mirror` to verify

## Constraints

- Must not change the return type of `useMockChat`

## Resources

- TypeScript reviewer and architecture reviewer findings
