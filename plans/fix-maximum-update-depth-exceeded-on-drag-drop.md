# Fix: Maximum Update Depth Exceeded on Drag and Drop

## Enhancement Summary

**Deepened on:** 2026-01-27
**Sections enhanced:** 6
**Research agents used:** best-practices-researcher, framework-docs-researcher, kieran-typescript-reviewer, julik-frontend-races-reviewer, code-simplicity-reviewer, performance-oracle, vercel-react-best-practices skill

### Key Improvements
1. Added functional setState pattern as the primary fix (prevents callback recreation)
2. Identified race condition risks with the ref pattern and provided mitigations
3. Added performance optimization for O(1) ticket lookups with index map
4. Included dnd-kit specific patterns from official documentation

### New Considerations Discovered
- Use `boardRef.current = board` directly in render (synchronous) instead of useEffect (async)
- Consider debouncing localStorage persistence to avoid blocking main thread during drag
- The `useEffectEvent` hook (React 19.2+) is the modern replacement for the ref pattern

---

## Overview

When dragging and dropping tickets on the Kanban board, React throws "Maximum update depth exceeded" error. The error originates from the Button component but the root cause is in the drag-and-drop state update cycle.

## Problem Statement

**Error:** `Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate.`

**Trigger:** Drag and drop of a ticket card on the Kanban board.

**Stack trace analysis:**
```
Button (components/ui/button.tsx:49)
  ← BoardColumnHeader (board-column-header.tsx:78)
  ← TooltipTrigger (tooltip.tsx:34)
  ← BoardColumn (board-column.tsx:55)
  ← BoardView (board-view.tsx:35)
  ← TasksBody (tasks-body.tsx:131)
```

## Root Cause Analysis

After analyzing the code, the root cause is a **circular re-render loop** caused by the interaction between:

1. **`useLocalStorage` hook** (`hooks/use-local-storage.ts:46-59`)
2. **`useBoardState` hook** (`features/task-board-core/hooks/use-board-state.ts`)
3. **`useBoardDnd` hook** (`features/task-board-core/hooks/use-board-dnd.ts`)

### The Cycle

1. **Drag over event triggers** → `handleDragOver` calls `onBoardUpdate`
2. **`onBoardUpdate` (setBoard)** → Updates board state in localStorage and dispatches `local-storage-change` custom event
3. **Custom event listener** (`use-local-storage.ts:50-58`) → Receives the event and calls `setStoredValue`
4. **This triggers a re-render** → Which causes `useBoardState` to re-run
5. **`findColumn` callback recreated** (`use-board-state.ts:93-103`) → Because it depends on `board` in its dependency array
6. **`handleDragOver` recreated** (`use-board-dnd.ts:100-167`) → Because it depends on `findColumn`
7. **DnD context detects handler change** → Potentially re-fires the drag over event
8. **LOOP** → Go to step 1

The key issue is the **same-tab localStorage sync mechanism** in `useLocalStorage` that dispatches a custom event and then listens for it on the same component, causing a re-render cascade.

Additionally, `findColumn` in `use-board-state.ts:93-103` has `board` in its dependency array, which causes it to be recreated on every board change, and this is passed to `useBoardDnd` which uses it in its `handleDragOver` dependency array.

### Research Insights: Root Cause

**Vercel Best Practice `rerender-dependencies`:** Specifying object dependencies (like `board`) instead of primitives causes callbacks to be recreated on every reference change. The ref pattern breaks this cycle.

**@dnd-kit Pattern:** The official dnd-kit documentation shows using functional setState (`setItems(items => move(items, event))`) which doesn't require the items in the dependency array.

---

## Proposed Solution

### Fix 1: Stabilize `findColumn` callback (Primary Fix)

The `findColumn` callback doesn't need to be recreated on every board change if we use a ref pattern:

**File:** `features/task-board-core/hooks/use-board-state.ts:93-103`

```typescript
// Before:
const findColumn = useCallback(
  (id: string, sourceBoard: BoardState = board): string | null => {
    for (const [columnId, tickets] of Object.entries(sourceBoard)) {
      if (tickets.some((t) => t.id === id)) {
        return columnId;
      }
    }
    return null;
  },
  [board]  // ❌ This dependency causes recreation on every board change
);

// After:
// Using a ref to access board state without including it in useCallback dependencies.
// This prevents findColumn from being recreated on every board change, which would
// cause infinite re-renders in dnd-kit's drag handlers.
const boardRef = useRef(board);
boardRef.current = board; // ✅ Synchronous update - no timing gap

const findColumn = useCallback(
  (id: string, sourceBoard?: BoardState): string | null => {
    const searchBoard: BoardState = sourceBoard ?? boardRef.current;
    for (const [columnId, tickets] of Object.entries(searchBoard)) {
      if (tickets.some((t) => t.id === id)) {
        return columnId;
      }
    }
    return null;
  },
  []  // ✅ Stable - uses ref pattern
);
```

### Research Insights: Ref Pattern

**Best Practice (Kent C. Dodds):** Use synchronous ref assignment (`boardRef.current = board`) rather than `useEffect` to avoid a timing gap where the ref holds stale data.

**Vercel Rule `advanced-event-handler-refs`:** Store callbacks in refs when used in effects that shouldn't re-subscribe on callback changes.

**Vercel Rule `advanced-use-latest`:** The `useLatest` pattern ensures stable callback refs while always accessing the latest values.

**React 19.2+ Alternative:** If using React 19.2+, consider `useEffectEvent` which provides this pattern built-in:
```typescript
import { useEffectEvent } from 'react';

const findColumn = useEffectEvent(
  (id: string, sourceBoard: BoardState = board): string | null => {
    // Can access latest board without dependency
  }
);
```

---

### Fix 2: Stabilize `findTicket` callback (Secondary Fix)

Apply the same ref pattern to `findTicket`:

**File:** `features/task-board-core/hooks/use-board-state.ts:105-114`

```typescript
// Before:
const findTicket = useCallback(
  (id: string): Ticket | null => {
    for (const tickets of Object.values(board)) {
      const ticket = tickets.find((t) => t.id === id);
      if (ticket) return ticket;
    }
    return null;
  },
  [board]  // ❌ Recreated on every board change
);

// After:
const findTicket = useCallback(
  (id: string): Ticket | null => {
    for (const tickets of Object.values(boardRef.current)) {
      const ticket = tickets.find((t) => t.id === id);
      if (ticket) return ticket;
    }
    return null;
  },
  []  // ✅ Stable
);
```

---

### Fix 3 (Optional): Use Functional setState in Drag Handlers

**Vercel Rule `rerender-functional-setstate`:** This is the most impactful pattern for preventing dependency cycles.

**File:** `features/task-board-core/hooks/use-board-dnd.ts:120`

The current code already uses functional setState (`onBoardUpdate((board) => {...})`), which is correct. However, ensure all state updates in drag handlers follow this pattern.

---

## Performance Optimizations

### Research Insights: Performance

**Issue Identified:** `findColumn` performs O(n) search on every drag event. With 100+ tickets and ~60 drag events/second, this creates 30,000+ iterations/second.

**Recommendation:** Add a ticket-to-column index map for O(1) lookups:

```typescript
// Add to use-board-state.ts

// Derived state - recalculated only when board changes
const ticketColumnMap = useMemo(() => {
  const map = new Map<string, string>();
  for (const [columnId, tickets] of Object.entries(board)) {
    for (const ticket of tickets) {
      map.set(ticket.id, columnId);
    }
  }
  return map;
}, [board]);

const ticketColumnMapRef = useRef(ticketColumnMap);
ticketColumnMapRef.current = ticketColumnMap;

const findColumn = useCallback(
  (id: string, sourceBoard?: BoardState): string | null => {
    if (!sourceBoard) {
      // O(1) lookup when using current board
      return ticketColumnMapRef.current.get(id) ?? null;
    }
    // O(n) fallback for explicit sourceBoard
    for (const [columnId, tickets] of Object.entries(sourceBoard)) {
      if (tickets.some((t) => t.id === id)) {
        return columnId;
      }
    }
    return null;
  },
  []
);
```

**Impact:** Reduces from 30,000 iterations/second to 60 O(1) lookups/second.

### Debounce localStorage Persistence (Optional)

**Issue:** localStorage writes are synchronous and block the main thread.

```typescript
// Consider adding to useBoardState or useLocalStorage
import { useDebouncedCallback } from 'use-debounce';

const persistBoard = useDebouncedCallback(
  (boardState: BoardState) => {
    localStorage.setItem('board', JSON.stringify(boardState));
  },
  300, // Wait 300ms after last change
  { maxWait: 1000 } // But persist at least every 1s during continuous drag
);
```

---

## Race Condition Mitigations

### Research Insights: Race Conditions

**Risk 1: Stale Ref Read** - During rapid drag operations, the ref might be read before it's updated.
- **Mitigation:** Use synchronous assignment (`boardRef.current = board`) instead of `useEffect`

**Risk 2: Stale Closure in Updater** - `activeColumn` computed outside updater may be stale.
- **Mitigation:** Recompute column IDs inside the updater function:
```typescript
onBoardUpdate((board) => {
  // Recompute inside updater using fresh board
  const activeColumn = findColumnFromBoard(active.id as string, board);
  const overColumn = findColumnFromBoard(over.id as string, board);
  // ...
});
```

**Risk 3: Same-Instance Event Echo** - The component that calls `setValue` receives its own custom event.
- **Mitigation:** Add instance ID to prevent self-triggering (optional, low priority)

---

## Acceptance Criteria

- [ ] Drag and drop tickets between columns without "Maximum update depth exceeded" error
- [ ] Drag and drop tickets within the same column to reorder without errors
- [ ] Board state persists correctly to localStorage after drag operations
- [ ] Timer functionality continues to work when moving tickets to/from "in-progress" column
- [ ] No regression in other board operations (add, edit, delete tickets)

## Implementation Steps

1. Add `boardRef` at the top of `useBoardState` hook
2. Use synchronous assignment `boardRef.current = board` (not useEffect)
3. Update `findColumn` to use `boardRef.current` as default when `sourceBoard` is not provided
4. Update `findTicket` to use `boardRef.current`
5. Remove `board` from dependency arrays of both callbacks
6. Add JSDoc comment explaining why the ref pattern is needed
7. Test drag and drop operations thoroughly

## Files to Modify

| File | Change |
|------|--------|
| `features/task-board-core/hooks/use-board-state.ts` | Add boardRef, update findColumn and findTicket |

## Testing Plan

1. **Manual Testing:**
   - Drag ticket from "Backlog" to "To Do" - verify no error, board updates
   - Drag ticket from "To Do" to "In Progress" - verify timer appears
   - Drag ticket within same column to reorder - verify no error
   - Drag multiple tickets rapidly between columns - stress test
   - Refresh page after drag - verify localStorage persistence

2. **Edge Cases:**
   - Drag while timer is running on a ticket
   - Drag the ticket that has active timer
   - Drag to "Complete" column - verify completedAt is set

3. **Race Condition Testing:**
   - Throttle CPU to 6x slowdown in Chrome DevTools
   - Rapidly drag a card back and forth between two columns
   - Verify no flickering or duplicate cards

## References

- `features/task-board-core/hooks/use-board-state.ts:93-103` - findColumn with board dependency
- `features/task-board-core/hooks/use-board-dnd.ts:60-64` - boardRef pattern already used here
- `hooks/use-local-storage.ts:46-59` - same-tab sync mechanism
- [React useCallback docs](https://react.dev/reference/react/useCallback)
- [The Latest Ref Pattern - Kent C. Dodds](https://www.epicreact.dev/the-latest-ref-pattern-in-react)
- [Why you shouldn't put refs in dependency arrays](https://www.epicreact.dev/why-you-shouldnt-put-refs-in-a-dependency-array)
- [dnd-kit Multiple Sortable Lists Guide](https://next.dndkit.com/react/guides/multiple-sortable-lists)
- Vercel React Best Practices: `rerender-functional-setstate`, `advanced-event-handler-refs`, `advanced-use-latest`

## Alternative Approaches Considered

### Alternative 1: Remove same-tab localStorage sync

Remove the custom event dispatch/listen mechanism in `useLocalStorage`. However, this would break cross-tab synchronization for the same tab, which may be intentional for some use cases.

**Rejected because:** May break expected behavior where multiple components need to stay in sync.

### Alternative 2: Debounce the drag handler

Add debouncing to `handleDragOver` to prevent rapid-fire updates.

**Rejected because:** This treats the symptom, not the root cause. The callback instability would still cause unnecessary re-renders even if the loop is broken by debouncing.

### Alternative 3: Use useMemo for board operations

Wrap the entire board operation logic in useMemo.

**Rejected because:** Over-complicated, and the ref pattern is the established React pattern for this problem.

### Alternative 4: Use `useEffectEvent` (React 19.2+)

The modern approach that replaces the manual ref pattern.

**Considered but not primary:** React 19.2+ required. Can be adopted later as the codebase upgrades.
