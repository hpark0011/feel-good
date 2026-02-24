---
id: FG_013
title: "Board state updates guard against double-click duplication"
date: 2026-02-24
type: fix
status: completed
priority: p2
description: "Board action callbacks (handleStartWork, handleFormSubmit, drag-drop) read ticket state via findTicket then queue setBoard updates. If called twice before React re-renders, findTicket returns stale state both times, causing updateBoardWithTicket to append a duplicate ticket to the target column. This is a pre-existing architectural pattern affecting all board mutations."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "Rapid double-click on to-do play button does not create duplicate ticket in in-progress column"
  - "Rapid double-click on form submit does not create duplicate ticket"
  - "grep -r 'isProcessingRef\\|processingRef\\|guardRef' apps/greyboard/ finds the guard pattern in handleStartWork and handleFormSubmit"
  - "pnpm build --filter=@feel-good/greyboard succeeds with no type errors"
owner_agent: "Greyboard board state specialist"
---

# Board state updates guard against double-click duplication

## Context

Discovered during code review of the play-button-on-todo feature (commit c5dc2e63). The pattern exists across all board mutation paths, not just the new `handleStartWork`.

The root cause: `findTicket` in `apps/greyboard/features/task-board-core/hooks/use-board-state.ts` reads from the current React state snapshot. When `setBoard` is called with a functional updater, React batches the update — the state doesn't change until the next render. A second call before re-render passes the same guards and queues a second update.

In `updateBoardWithTicket` (`apps/greyboard/features/task-board-core/utils/board-state.utils.ts:47-52`), the second functional updater receives the already-updated board, fails to find the ticket in the old column (filter is a no-op), but still appends the ticket to the new column — creating a duplicate.

Affected handlers in `apps/greyboard/app/(protected)/dashboard/tasks/_components/tasks-body.tsx`:
- `handleStartWork` (line 65)
- `handleFormSubmit` (line 81)

Drag-and-drop is less affected because `@dnd-kit` has built-in event debouncing.

## Goal

Board mutation callbacks are idempotent under rapid invocation — no duplicate tickets appear regardless of click speed.

## Scope

- Add a `useRef`-based processing guard to `handleStartWork`
- Add a `useRef`-based processing guard to `handleFormSubmit`
- Both guards reset after the React render cycle completes (via `queueMicrotask` or `useEffect`)

## Out of Scope

- Refactoring `updateBoardWithTicket` to be inherently idempotent (larger change, separate ticket)
- Adding guards to drag-and-drop handlers (`@dnd-kit` already debounces)
- UI-level debouncing (e.g., disabling buttons) — the ref guard is simpler and more reliable

## Approach

Add an `isProcessingRef = useRef(false)` in `TasksBody`. At the top of each handler, check the ref and bail if true. Set it to true before the `setBoard` call. Reset it after the state update is applied — use `queueMicrotask(() => { isProcessingRef.current = false })` to reset after the synchronous batch completes.

This is the lightest-touch fix: one ref, two guard checks, no API changes.

- **Effort:** Small
- **Risk:** Low

## Implementation Steps

1. Add `const isProcessingRef = useRef(false)` in `TasksBody` component in `apps/greyboard/app/(protected)/dashboard/tasks/_components/tasks-body.tsx`
2. In `handleStartWork`: add early return if `isProcessingRef.current` is true, set to true before `setBoard`, reset via `queueMicrotask`
3. In `handleFormSubmit`: add the same guard pattern
4. Verify: `pnpm build --filter=@feel-good/greyboard` passes
5. Manual test: rapidly double-click the play button on a to-do ticket, confirm only one ticket appears in in-progress

## Constraints

- Must not change any component interfaces or prop signatures
- Must not introduce async behavior or `setTimeout` (use `queueMicrotask` for microtask-level reset)
- Guard must be invisible to child components

## Resources

- `updateBoardWithTicket`: `apps/greyboard/features/task-board-core/utils/board-state.utils.ts:23-53`
- `findTicket` / `setBoard`: `apps/greyboard/features/task-board-core/hooks/use-board-state.ts`
- React 19 automatic batching: state updates within event handlers are batched into a single render
