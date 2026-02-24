# Plan: Play Button on To-Do Tickets

## Context

The play/timer button on ticket cards is currently only visible when a ticket is in the "in-progress" column. The user wants it also visible in "to-do", where clicking it moves the ticket to "in-progress" and starts the timer in one action.

## Approach

Thread an `onStartWork` callback through the existing component chain (same pattern as `onEdit`/`onDelete`). The callback is defined at the board orchestrator level where `setBoard` and the timer store are available.

## Changes (8 files)

### 1. `tasks-body.tsx` — Define `handleStartWork`
**Path:** `apps/greyboard/app/(protected)/dashboard/tasks/_components/tasks-body.tsx`

Add a `handleStartWork(ticketId)` callback that:
- Finds the ticket via `findTicket`
- Guards: only acts if `ticket.status === "to-do"`
- Moves ticket from "to-do" to "in-progress" via `actions.setBoard` + `updateBoardWithTicket`
- Starts the timer via `useStopWatchStore.getState().startTimer()`

Pass `onStartWork={handleStartWork}` to both `<BoardView>` and `<ListView>`.

### 2. `board-view.tsx` — Thread prop
**Path:** `apps/greyboard/features/kanban-board/components/board-view.tsx`

Add `onStartWork?: (ticketId: string) => void` to interface. Pass to `<BoardColumn>`.

### 3. `board-column.tsx` — Thread prop, bind ticket ID
**Path:** `apps/greyboard/features/kanban-board/components/board-column.tsx`

Add `onStartWork?: (ticketId: string) => void` to interface. Pass to `<TicketCard>` as `onStartWork={() => onStartWork(ticket.id)}`.

### 4. `list-view.tsx` — Thread prop
**Path:** `apps/greyboard/features/task-list/components/list-view.tsx`

Same as board-view: add to interface, pass to `<ListSection>`.

### 5. `list-section.tsx` — Thread prop, bind ticket ID
**Path:** `apps/greyboard/features/task-list/components/list-section.tsx`

Same as board-column: add to interface, bind and pass to `<TicketCard>`.

### 6. `ticket-card.tsx` — Accept and forward
**Path:** `apps/greyboard/features/ticket-card/components/ticket-card.tsx`

Add `onStartWork?: () => void` to `TicketCardProps`. Pass to `<TicketCardHeader>`.

### 7. `ticket-card-header.tsx` — Expand visibility condition
**Path:** `apps/greyboard/features/ticket-card/components/ticket-card-header.tsx`

- Add `onStartWork?: () => void` to props
- Change condition from `ticket.status === "in-progress"` to `(ticket.status === "in-progress" || ticket.status === "to-do")`
- Pass `onStartWork` to `<TicketTimerButton>` only when status is "to-do"

### 8. `ticket-timer-button.tsx` — Branch click handler
**Path:** `apps/greyboard/features/ticket-card/components/ticket-timer-button.tsx`

- Add `onStartWork?: () => void` to props
- Click handler: if `onStartWork` exists, call it and return (it handles both move + timer start)
- Otherwise, existing toggle logic unchanged
- Tooltip: show "Start Working" when `onStartWork` is provided

## Edge Cases

- **Timer on another ticket**: `startTimer()` already stops any active timer first
- **Drag conflicts**: Button clicks are already filtered out by `target.closest("button")` in the card click handler
- **Backlog tickets**: Only "to-do" gets the button, not "backlog" — handled by the visibility condition

## Verification

1. `pnpm build --filter=@feel-good/greyboard` — no type errors
2. Visual check: play button appears on to-do tickets
3. Click play on a to-do ticket → ticket moves to in-progress, timer starts
4. Click play/pause on in-progress ticket → existing toggle behavior unchanged
5. Verify in both board and list layouts
