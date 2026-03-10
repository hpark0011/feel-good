---
id: FG_065
title: "Mock chat setTimeout not cleaned up on unmount"
date: 2026-03-10
type: fix
status: to-do
priority: p2
description: "In useMockChat, the 300ms setTimeout calls for simulating network latency are not tracked or cleaned up on unmount. If the component unmounts during the delay, startStreaming runs after unmount, causing state updates on an unmounted component."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "grep -n 'timeoutRef' apps/mirror/features/chat/hooks/use-mock-chat.ts returns at least one match"
  - "grep -n 'clearTimeout' apps/mirror/features/chat/hooks/use-mock-chat.ts returns at least one match"
  - "pnpm build --filter=@feel-good/mirror completes without errors"
owner_agent: "React lifecycle cleanup fixer"
---

# Mock chat setTimeout not cleaned up on unmount

## Context

Discovered during architecture review of `feat-rag` branch. In `apps/mirror/features/chat/hooks/use-mock-chat.ts`, the cleanup effect on line 68-72 only clears `intervalRef`. The `setTimeout` calls at lines 135 and 156 (used to simulate network latency before streaming starts) are fire-and-forget. They are not tracked in a ref and not cleaned up on unmount.

If the user navigates away during the 300ms delay, `startStreaming` will execute on an unmounted component, calling `setIsStreaming(true)` and creating a new interval.

## Goal

All timers (both setInterval and setTimeout) are properly tracked and cleaned up when the hook unmounts.

## Scope

- Add a `timeoutRef` to track the pending setTimeout
- Clear it in the cleanup effect

## Out of Scope

- Refactoring the streaming mechanism
- This overlaps with FG_059 which also adds timeout tracking. Implement together.

## Approach

Add a timeout ref, store setTimeout return values, and clear in the cleanup effect alongside intervalRef.

- **Effort:** Small
- **Risk:** Low

## Implementation Steps

1. Add `timeoutRef` in `useMockChat`
2. Store the `setTimeout` return in `timeoutRef.current` at lines 135 and 156
3. Update the cleanup effect to also clear `timeoutRef.current`
4. Run `pnpm build --filter=@feel-good/mirror` to verify

## Constraints

- Can be implemented together with FG_059 since they touch the same code

## Resources

- Architecture strategist review finding
