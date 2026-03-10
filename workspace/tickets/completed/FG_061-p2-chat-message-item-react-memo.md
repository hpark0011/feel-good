---
id: FG_061
title: "ChatMessageItem re-renders all messages on every streaming tick"
date: 2026-03-10
type: perf
status: to-do
priority: p2
description: "ChatMessageItem is not wrapped in React.memo, causing every message in the list to re-render on every streaming character update. At 100 messages this is 3,300 component renders per second. Wrapping in React.memo is trivial and prevents N-1 unnecessary re-renders."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "grep -n 'React.memo' apps/mirror/features/chat/components/chat-message-item.tsx returns at least one match"
  - "pnpm build --filter=@feel-good/mirror completes without errors"
  - "The component still accepts all existing props (message, avatarUrl, profileName, onRetry, animateSend)"
owner_agent: "React performance optimizer"
---

# ChatMessageItem re-renders all messages on every streaming tick

## Context

Discovered during performance review of `feat-rag` branch. In `apps/mirror/features/chat/components/chat-message-item.tsx`, the component is a plain function component with no memoization. Every time the `messages` array changes (which happens on every streaming character update — ~33 times/second), the parent `ChatMessageList` re-renders, producing new `ChatMessageItem` elements for every message in the list.

Only the last message (the streaming one) has actually changed. The other N-1 messages receive identical props but still re-render, running `useSmoothText`, evaluating className logic, and reconciling child components.

## Goal

Only the message whose props actually changed re-renders during streaming, reducing render work from O(N) to O(1) per streaming tick.

## Scope

- Wrap `ChatMessageItem` in `React.memo`

## Out of Scope

- Memoizing the filtered messages array in `ChatMessageList` (separate optimization)
- Changing the scroll effect dependency

## Approach

Wrap the existing `ChatMessageItem` function in `React.memo`. The message objects from Convex streaming have referential equality for unchanged messages (they come from a paginated query), so `React.memo`'s shallow comparison will correctly skip unchanged items.

- **Effort:** Small
- **Risk:** Low

## Implementation Steps

1. In `chat-message-item.tsx`, change `export function ChatMessageItem(...)` to `export const ChatMessageItem = React.memo(function ChatMessageItem(...) { ... })`
2. Run `pnpm build --filter=@feel-good/mirror` to verify
3. Optionally verify with React DevTools Profiler that only the streaming message re-renders

## Constraints

- No changes to the component's API or behavior
- Must keep the function name for React DevTools display

## Resources

- Performance Oracle review finding
