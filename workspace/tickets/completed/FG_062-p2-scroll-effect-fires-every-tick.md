---
id: FG_062
title: "Auto-scroll effect runs on every streaming tick instead of new messages only"
date: 2026-03-10
type: perf
status: to-do
priority: p2
description: "The auto-scroll useEffect in ChatMessageList depends on [messages] which changes on every streaming character update. The ref guard prevents actual scrolling, but the effect body still executes ~33 times/sec. Deriving lastKey outside the effect and using [lastKey] as the dependency eliminates unnecessary executions."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "grep -n 'lastKey' apps/mirror/features/chat/components/chat-message-list.tsx shows lastKey derived outside the effect and used as dependency"
  - "The effect no longer depends on [messages] directly"
  - "pnpm build --filter=@feel-good/mirror completes without errors"
owner_agent: "React performance optimizer"
---

# Auto-scroll effect runs on every streaming tick instead of new messages only

## Context

Discovered during performance review of `feat-rag` branch. In `apps/mirror/features/chat/components/chat-message-list.tsx:117-123`, the auto-scroll effect depends on `[messages]`. During streaming, the `messages` array reference changes on every character update (~33 times/sec). The effect body runs each time: reads `messages.at(-1)?.key`, compares with `lastKeyRef`, and updates the ref. The `scrollIntoView` call is guarded by the key comparison so actual scrolling doesn't happen redundantly, but the effect execution is unnecessary work.

The previous implementation correctly used `[lastKey]` as the dependency (derived outside the effect), which only triggered when a genuinely new message appeared.

## Goal

The auto-scroll effect only executes when a new message key appears, not on every streaming text update.

## Scope

- Derive `const lastKey = messages.at(-1)?.key` in the component body
- Use `[lastKey]` as the effect dependency
- Remove `lastKeyRef` (no longer needed — React's effect dependency handles deduplication)

## Out of Scope

- Filtering messages before deriving the key (separate concern)
- Throttling scroll behavior

## Approach

Revert to the pattern of deriving `lastKey` outside the effect. This was the original approach before the changeset modified it.

- **Effort:** Small
- **Risk:** Low

## Implementation Steps

1. In `ChatMessageList`, move `const lastKey = messages.at(-1)?.key` to the component body (outside the effect)
2. Change the effect to depend on `[lastKey]` and call `scrollIntoView` when `lastKey` is truthy
3. Remove `lastKeyRef` since it's no longer needed
4. Run `pnpm build --filter=@feel-good/mirror` to verify

## Constraints

- Must still auto-scroll when new messages arrive
- Must not scroll on streaming text updates to existing messages

## Resources

- Performance Oracle review finding
