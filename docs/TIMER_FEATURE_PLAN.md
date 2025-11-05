# Timer Feature Implementation Plan

## Overview

Implement a per-ticket timer system that tracks time spent on tasks, helping users:
1. Create a sense of urgency for task completion
2. Break down tasks by understanding time investment
3. Build accurate time estimation skills

## Requirements

- Each ticket has its own duration field (accumulated time in seconds)
- Timer controls: Start, Pause, Stop states
- Play icon in ticket-card.tsx starts timer and toggles to pause button
- Moving ticket to "Complete" status records the final duration
- Moving ticket to "Backlog" or "To-Do" resets the timer
- Use Zustand for global timer state management
- Only one timer can be actively running at a time

---

## 🚨 Technical Challenges

### 1. Storage Thrashing Prevention

**Problem**: The board commits every change to localStorage (see `board.tsx` setBoard calls). Naively updating elapsed time every second (60 writes/minute) would destroy performance and wear out storage.

**Solution**:
- Keep live tick data (elapsed time, interval) ONLY in Zustand memory
- Commit duration snapshots to localStorage ONLY on state transitions:
  - Timer start
  - Timer pause
  - Timer stop
  - Status change to "Complete" (record duration)
  - Status change to "Backlog"/"To-Do" (reset)

### 2. Drag-and-Drop Status Mutations

**Problem**: `handleDragOver` in `board.tsx` mutates ticket status while the card is being dragged (hovering over columns). This could accidentally trigger timer resets when dragging an "in-progress" card over a "backlog" column, even if the user doesn't release it there.

**Solution**:
- Apply timer logic ONLY in `handleDragEnd` (when drag completes)
- Do NOT hook into `handleDragOver` (preview state during drag)
- Use previous vs. new status comparison to detect actual changes

### 3. Multiple Entry Points for Status Changes

**Problem**: Status can change through TWO different code paths:
- Drag-and-drop handlers in `board.tsx`
- Form submission in `ticket-form-dialog.tsx` (editing status via select)

**Solution**: Create shared utility functions that both paths can call:
```typescript
handleTimerOnStatusChange(ticketId, oldStatus, newStatus, stopWatchStore, board, setBoard)
```

### 4. Timer Accuracy with Inactive Tabs

**Problem**: JavaScript `setInterval` is throttled to ~1000ms when browser tab is inactive, causing inaccurate time tracking.

**Solution**: Use timestamp-based calculation instead of incremental counting:
```typescript
// ❌ DON'T: Incremental (inaccurate)
setInterval(() => { elapsed += 1 }, 1000)

// ✅ DO: Timestamp-based (accurate)
const startTime = Date.now()
setInterval(() => {
  elapsed = Math.floor((Date.now() - startTime) / 1000)
}, 1000)
```

### 5. Per-Ticket Timer Architecture

**Problem**: Each ticket can have duration metadata, but only ONE timer should be actively running (ticking) at a time across all tickets.

**Solution**: Store a single `activeTicketId` in Zustand:
- When starting a timer, check if another is running and stop it first
- UI shows play/pause based on whether `activeTicketId === ticket.id`
- Multiple tickets can have accumulated duration, but only one can be actively counting

### 6. Page Reload Hydration Strategy

**Problem**: If user refreshes the page with a timer running, should it auto-resume or stop?

**Decision**: Reset running timers to "stopped" state on page reload, preserving accumulated duration.

**Rationale**:
- Auto-resuming creates invisible timers (user forgets it's running)
- Better to require explicit user action to restart
- Preserving duration ensures no data loss

---

## Current Implementation State

### ✅ Already Exists

1. **Basic Zustand Store** (`store/stop-watch-store.ts`)
   - Actions: `startTimer`, `pauseTimer`, `stopTimer`, `resetTimer`
   - State: Single `stopWatchState` enum (stopped/running/paused)
   - **Missing**: No ticket ID association, no elapsed time tracking, no interval management

2. **UI Controls** (`components/tasks/ticket-card.tsx`)
   - Play/Pause button visible only when `ticket.status === "in-progress"`
   - Icons: PlayFillIcon, PauseFillIcon
   - Button toggle based on global stopwatch state
   - **Missing**: No timer display, no duration field, no stop button

3. **Auto-Stop Hook** (`components/tasks/ticket-card.tsx` lines 152-161)
   - useEffect monitors status changes
   - Calls `stopTimer()` when status changes from "in-progress"
   - **Issue**: Doesn't pass ticket ID or record duration

4. **localStorage Infrastructure** (`lib/storage.ts`)
   - Board state serialization/deserialization
   - Storage key: "docgen.v1.tasks.board-state"
   - **Missing**: Duration field not included in Ticket serialization

5. **Icon Assets** (available in `/icons`)
   - PlayFillIcon ✓
   - PauseFillIcon ✓
   - StopFillIcon ✓ (unused)
   - StopWatchFillIcon ✓ (unused)
   - ClockFillIcon ✓ (unused)

### ❌ Needs Implementation

**Data Model:**
- [ ] Add `duration?: number` field to Ticket interface
- [ ] Update board config initial state for new field
- [ ] Update storage serialization/deserialization
- [ ] Add validation for duration field

**Store Architecture:**
- [ ] Refactor Zustand to per-ticket timer system
- [ ] Track: activeTicketId, startTime, accumulatedTime, intervalId
- [ ] Implement timestamp-based ticker (not incremental)
- [ ] Add selectors for per-ticket elapsed time
- [ ] Add commitDuration() action to write back to board
- [ ] Persist state to localStorage (only on transitions)
- [ ] Single active timer enforcement guard

**UI Components:**
- [ ] Timer display component (MM:SS or HH:MM:SS format)
- [ ] Pass ticket.id to timer actions
- [ ] Check if this ticket is activeTicketId for button state
- [ ] Show total duration when timer not active
- [ ] Optional: Stop button UI

**Business Logic:**
- [ ] Shared utility functions for status-triggered actions
- [ ] Hook into handleDragEnd (NOT handleDragOver) in board.tsx
- [ ] Hook into ticket-form-dialog.tsx status changes
- [ ] Complete status → record duration
- [ ] Backlog/To-Do status → reset timer
- [ ] Single active timer prevention logic

**Hydration:**
- [ ] On page load, reset running timers to "stopped"
- [ ] Preserve accumulated duration from localStorage

---

## Files to Modify

### 1. `types/board.types.ts` - Add Duration Field

**Changes:**
```typescript
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: ColumnId;
  projectId?: string;
  subTasks?: SubTask[];
  duration?: number; // ← ADD: Total accumulated time in seconds
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. `config/board.config.ts` - Update Initial State

**Changes:**
- Add `duration: 0` to all sample tickets in INITIAL_BOARD_STATE

### 3. `store/stop-watch-store.ts` - Major Refactor

**Current Structure:**
```typescript
interface StopWatchStore {
  stopWatchState: StopWatchState;
  startTimer: () => void;
  stopTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
}
```

**New Structure:**
```typescript
interface StopWatchStore {
  // Active timer state
  activeTicketId: string | null;
  startTime: number | null;          // timestamp when started
  accumulatedTime: number;           // seconds accumulated in this session
  intervalId: NodeJS.Timer | null;

  // Actions
  startTimer: (ticketId: string) => void;
  pauseTimer: () => void;
  stopTimer: () => void;
  resetTimer: (ticketId: string) => void;

  // Selectors
  getElapsedTime: (ticketId: string) => number;
  isTimerActive: (ticketId: string) => boolean;
  getTimerState: (ticketId: string) => "stopped" | "running" | "paused";

  // Persistence
  commitDuration: (ticketId: string, duration: number) => void;
}
```

**Key Implementation Details:**
- Use timestamp-based calculation: `Math.floor((Date.now() - startTime) / 1000) + accumulatedTime`
- Single timer guard: Stop any running timer before starting new one
- Persist to localStorage key: "docgen.v1.tasks.timer-state"
- Cleanup interval on unmount/stop

### 4. `lib/storage.ts` - Update Serialization

**Changes:**
- Add `duration` to ticket serialization schema
- Add validation in `deserializeBoard` for duration field
- Ensure duration defaults to 0 if missing

### 5. `components/tasks/ticket-card.tsx` - UI Updates

**Changes:**
- Add timer display component (show elapsed time in MM:SS or HH:MM:SS)
- Update play/pause handlers to pass `ticket.id`
- Check if `activeTicketId === ticket.id` for button state
- Show total `ticket.duration` when timer not active
- Enhanced useEffect for status-driven duration recording/reset

**UI Layout:**
```
┌─────────────────────────────────────┐
│ [Title]              [🕐 12:34] [▶] │  ← Timer display + controls
│ Description...                      │
│ □ Subtask 1                        │
│ [Project Tag]                      │
└─────────────────────────────────────┘
```

### 6. `components/tasks/board.tsx` - Add Duration Logic

**Critical Changes:**
- **handleDragEnd** (lines 219-260):
  - Detect status changes (old vs new status)
  - Call timer utility function
  - Apply complete → record, backlog/to-do → reset logic
  - **DO NOT** modify handleDragOver (lines 162-217)

- **handleFormSubmit** (lines 328-389):
  - Same status change detection
  - Call timer utility function

**Example Hook:**
```typescript
// In handleDragEnd, after status change
if (oldStatus !== newStatus) {
  handleTimerOnStatusChange(
    ticketId,
    oldStatus,
    newStatus,
    useStopWatchStore.getState(),
    board,
    setBoard
  );
}
```

### 7. `components/tasks/ticket-form-dialog.tsx` - Form Integration

**Changes:**
- Pass through `duration` field when editing ticket
- Apply timer logic when status field changes in form
- Import and call timer utility function

### 8. `hooks/use-ticket-form.ts` - Form Logic

**Changes:**
- Include `duration` in form data (optional field)
- Sync duration changes with timer store
- Ensure duration not editable directly (read-only display)

### 9. `lib/storage-keys.ts` - Add Constant

**Changes:**
```typescript
const STORAGE_KEYS = {
  TASKS: {
    BOARD_STATE: "docgen.v1.tasks.board-state",
    TIMER_STATE: "docgen.v1.tasks.timer-state", // ← ADD
    PROJECTS: "docgen.v1.tasks.projects",
  },
  // ...
};
```

### 10. `lib/timer-utils.ts` - NEW FILE - Shared Utilities

**Purpose**: Keep timer logic DRY between board.tsx and ticket-form-dialog.tsx

**Functions:**
```typescript
/**
 * Handles timer state changes triggered by ticket status changes
 */
export function handleTimerOnStatusChange(
  ticketId: string,
  oldStatus: ColumnId,
  newStatus: ColumnId,
  stopWatchStore: StopWatchStore,
  board: Board,
  setBoard: (board: Board) => void
): void;

/**
 * Formats duration in seconds to readable time string
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "12:34" or "1:23:45")
 */
export function formatDuration(seconds: number): string;

/**
 * Records final duration to ticket when timer stops
 */
export function recordDuration(
  ticketId: string,
  duration: number,
  board: Board,
  setBoard: (board: Board) => void
): void;

/**
 * Resets timer and duration for a ticket
 */
export function resetTimerForTicket(
  ticketId: string,
  stopWatchStore: StopWatchStore,
  board: Board,
  setBoard: (board: Board) => void
): void;
```

---

## Implementation Sequence

### Phase 1: Data Foundation
1. Add `duration` field to Ticket type
2. Update board config initial state
3. Update storage serialization/deserialization
4. Add storage key constant

**Success Criteria**: Board state persists with duration field

### Phase 2: Store Architecture
5. Refactor Zustand stopwatch store
   - Per-ticket architecture
   - Timestamp-based ticker
   - Single active timer guard
   - commitDuration action

**Success Criteria**: Store can track time for specific tickets

### Phase 3: Shared Utilities
6. Create `timer-utils.ts`
   - Status change handler
   - Duration formatter
   - Record/reset functions

**Success Criteria**: Utility functions ready for integration

### Phase 4: UI Integration
7. Update `ticket-card.tsx`
   - Add timer display
   - Update controls to pass ticketId
   - Show duration when not timing

**Success Criteria**: Timer displays and controls work per ticket

### Phase 5: Business Logic Integration
8. Hook `board.tsx` handleDragEnd (NOT handleDragOver)
9. Hook `ticket-form-dialog.tsx` status changes
10. Hook `use-ticket-form.ts` for duration field

**Success Criteria**: Timer records on complete, resets on backlog/to-do

### Phase 6: Testing & Edge Cases
11. Test drag-and-drop during active timer
12. Test page reload with active timer
13. Test multiple timer start attempts
14. Test status changes via both drag and form

**Success Criteria**: All edge cases handled correctly

---

## Key Design Decisions

### 1. Commit Cadence
**Decision**: Write to localStorage only on state transitions, not every tick

**Rationale**: Prevents storage thrashing (60+ writes/min → ~5 writes per timer session)

### 2. Drag-and-Drop Guard
**Decision**: Apply timer rules in `handleDragEnd`, not `handleDragOver`

**Rationale**: Prevents accidental resets from preview states during dragging

### 3. Hydration Strategy
**Decision**: Reset running timers to "stopped" on page reload

**Rationale**: Avoids invisible timers, preserves data, requires explicit user action

### 4. Single Active Timer
**Decision**: Use guard in `startTimer()` to stop any running timer first

**Rationale**: Prevents multiple simultaneous timers, clearer UX

### 5. Duration Storage Format
**Decision**: Store duration in seconds (number)

**Rationale**: Easy arithmetic, format in UI layer with date-fns

### 6. Timer Accuracy
**Decision**: Use timestamp-based calculation, not incremental

**Rationale**: Accurate even when tab inactive/throttled

---

## Testing Checklist

- [ ] Start timer on "in-progress" ticket
- [ ] Pause and resume timer
- [ ] Move timed ticket to "Complete" - duration recorded
- [ ] Move timed ticket to "Backlog" - timer reset
- [ ] Drag ticket with active timer over columns - no premature reset
- [ ] Try starting timer on second ticket - first timer stops
- [ ] Reload page with active timer - resets gracefully
- [ ] Edit ticket status via form to "Complete" - duration recorded
- [ ] Timer display updates every second while running
- [ ] Total duration displays when timer stopped
- [ ] localStorage writes only on transitions, not every tick
- [ ] Timer accurate even after tab inactive for 1+ minute

---

## Future Enhancements (Out of Scope)

- Timer history/detailed time entries per ticket
- Global timer indicator in app header
- Keyboard shortcuts (spacebar to start/pause)
- Sound notifications on timer events
- Daily/weekly time tracking reports
- Export time data to CSV
- Pomodoro-style timer intervals
- Timer goals and alerts

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interactions                         │
│  - Click play/pause in ticket-card.tsx                      │
│  - Drag ticket to new status                                │
│  - Edit ticket status in form                               │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              Zustand Store (stop-watch-store.ts)            │
│  State: activeTicketId, startTime, accumulatedTime          │
│  Actions: startTimer(id), pauseTimer(), stopTimer()         │
│  Ticker: setInterval with timestamp calculation             │
│  Guard: Stop running timer before starting new one          │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              Timer Utilities (timer-utils.ts)                │
│  handleTimerOnStatusChange() - Complete/Backlog/ToDo logic  │
│  recordDuration() - Write duration to board                 │
│  resetTimerForTicket() - Clear timer state                  │
│  formatDuration() - Convert seconds to MM:SS                │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              Board State (localStorage)                      │
│  Ticket { duration: number, status: ColumnId, ... }        │
│  Commits: Only on start/pause/stop/status change           │
└─────────────────────────────────────────────────────────────┘
```

---

## References

- **Zustand Documentation**: https://zustand.docs.pmnd.rs
- **date-fns Format**: https://date-fns.org/docs/format
- **localStorage Best Practices**: Minimize writes, serialize efficiently
- **React useEffect Dependencies**: Use refs for callbacks to avoid re-runs

---

**Document Version**: 1.0
**Last Updated**: 2025-11-03
**Status**: Ready for Implementation
