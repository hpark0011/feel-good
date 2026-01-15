import type { BoardState, ColumnId, Ticket } from "@/types/board.types";
import type { TicketFormValues } from "../hooks/use-board-form";
import { useStopWatchStore } from "@/store/stop-watch-store";

/**
 * Creates a new Ticket from form data.
 *
 * Generates a unique ID and sets initial timestamps. Sets completedAt
 * if the ticket is created in the "complete" status.
 *
 * @param data - Form values from the ticket form
 * @returns A new Ticket object ready to be added to the board
 *
 * @example
 * const ticket = createTicketFromFormData({
 *   title: "Fix bug",
 *   description: "Fix the login bug",
 *   status: "to-do",
 *   projectId: "proj-1",
 *   subTasks: []
 * });
 */
export function createTicketFromFormData(data: TicketFormValues): Ticket {
  const now = new Date();
  return {
    id: `ticket-${Date.now()}`,
    title: data.title,
    description: data.description,
    status: data.status,
    projectId: data.projectId,
    subTasks: data.subTasks,
    duration: 0,
    timeEntries: [],
    completedAt: data.status === "complete" ? now : null,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Creates an updated Ticket from an existing ticket and form data.
 *
 * Preserves ticket ID and timestamps, updating them appropriately.
 * Sets completedAt if moving to "complete" status, clears it otherwise.
 *
 * @param ticket - The existing ticket to update
 * @param data - Form values from the ticket form
 * @returns An updated Ticket object
 *
 * @example
 * const updated = updateTicketFromFormData(existingTicket, {
 *   title: "Updated title",
 *   description: "New description",
 *   status: "in-progress",
 *   projectId: "proj-2",
 *   subTasks: []
 * });
 */
export function updateTicketFromFormData(
  ticket: Ticket,
  data: TicketFormValues
): Ticket {
  const now = new Date();
  return {
    ...ticket,
    title: data.title,
    description: data.description,
    status: data.status,
    projectId: data.projectId,
    subTasks: data.subTasks,
    updatedAt: now,
    completedAt:
      data.status === "complete"
        ? ticket.completedAt ?? now
        : null,
  };
}

/**
 * Updates board state with a ticket, handling column movement.
 *
 * If the ticket stays in the same column, updates it in place.
 * If the ticket moves to a different column, removes it from the old
 * column and adds it to the new column.
 *
 * @param board - Current board state
 * @param ticket - Ticket to add or update
 * @param oldColumn - Column ID where the ticket currently exists (null for new tickets)
 * @param newColumn - Column ID where the ticket should be placed
 * @returns Updated board state
 *
 * @example
 * // Update ticket in same column
 * const updated = updateBoardWithTicket(board, ticket, "to-do", "to-do");
 *
 * // Move ticket between columns
 * const moved = updateBoardWithTicket(board, ticket, "to-do", "in-progress");
 */
export function updateBoardWithTicket(
  board: BoardState,
  ticket: Ticket,
  oldColumn: ColumnId | null,
  newColumn: ColumnId
): BoardState {
  // New ticket: just add to the target column
  if (oldColumn === null) {
    return {
      ...board,
      [newColumn]: [...(board[newColumn] || []), ticket],
    };
  }

  // Same column: update ticket in place
  if (oldColumn === newColumn) {
    return {
      ...board,
      [oldColumn]: board[oldColumn].map((t) =>
        t.id === ticket.id ? ticket : t
      ),
    };
  }

  // Different column: remove from old, add to new
  return {
    ...board,
    [oldColumn]: board[oldColumn].filter((t) => t.id !== ticket.id),
    [newColumn]: [...(board[newColumn] || []), ticket],
  };
}

/**
 * Synchronizes timer title when a ticket's title changes.
 *
 * Only updates the timer if there's an active timer for this ticket
 * and the title actually changed.
 *
 * @param ticketId - ID of the ticket being updated
 * @param oldTitle - Previous title of the ticket
 * @param newTitle - New title of the ticket
 *
 * @example
 * syncTimerOnTicketUpdate("ticket-123", "Old title", "New title");
 */
export function syncTimerOnTicketUpdate(
  ticketId: string,
  oldTitle: string,
  newTitle: string
): void {
  if (oldTitle === newTitle) return;

  const stopWatchStore = useStopWatchStore.getState();
  if (stopWatchStore.activeTicketId === ticketId) {
    stopWatchStore.updateActiveTicketTitle(ticketId, newTitle);
  }
}
