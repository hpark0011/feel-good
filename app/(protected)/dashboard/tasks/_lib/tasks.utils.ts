import { INITIAL_BOARD_STATE } from "@/config/board.config";
import { BoardState, Ticket, SubTask, TimeEntry, ColumnId } from "@/types/board.types";
import type { StopWatchStore } from "@/store/stop-watch-store";
import { getStorageKey } from "@/lib/storage-keys";

// ============================================================================
// Board Storage Constants
// ============================================================================

export const BOARD_STORAGE_KEY = getStorageKey("TASKS", "BOARD_STATE");

// ============================================================================
// Board Serialization Types
// ============================================================================

export interface SerializedBoardData {
  version: number;
  data: BoardState;
  lastModified: string;
}

const CURRENT_VERSION = 1;

// ============================================================================
// Board Serialization Functions
// ============================================================================

export function serializeBoardData(boardState: BoardState): string {
  try {
    const serializedData: SerializedBoardData = {
      version: CURRENT_VERSION,
      data: serializeTickets(boardState),
      lastModified: new Date().toISOString(),
    };

    return JSON.stringify(serializedData);
  } catch (error) {
    console.error("Error serializing board data:", error);
    throw new Error("Failed to serialize board data");
  }
}

export function deserializeBoardData(data: string): BoardState {
  try {
    const parsed: SerializedBoardData = JSON.parse(data);

    return deserializeTickets(parsed.data);
  } catch (error) {
    console.error("Error deserializing board data:", error);
    throw new Error("Failed to deserialize board data");
  }
}

function serializeTickets(boardState: BoardState): BoardState {
  const serialized: BoardState = {};

  for (const [columnId, tickets] of Object.entries(boardState)) {
    serialized[columnId] = tickets.map((ticket) => ({
      ...ticket,
      createdAt: ticket.createdAt.toISOString() as unknown as Date,
      updatedAt: ticket.updatedAt.toISOString() as unknown as Date,
      completedAt: ticket.completedAt
        ? (ticket.completedAt.toISOString() as unknown as Date)
        : null,
      timeEntries: ticket.timeEntries?.map((entry) => ({
        ...entry,
        start: entry.start.toISOString() as unknown as Date,
        end: entry.end.toISOString() as unknown as Date,
      })),
    }));
  }

  return serialized;
}

function deserializeTickets(boardState: BoardState): BoardState {
  const deserialized: BoardState = {};

  for (const [columnId, tickets] of Object.entries(boardState)) {
    deserialized[columnId] = tickets.map((ticket) => ({
      ...ticket,
      createdAt: new Date(ticket.createdAt as unknown as string),
      updatedAt: new Date(ticket.updatedAt as unknown as string),
      completedAt: ticket.completedAt
        ? new Date(ticket.completedAt as unknown as string)
        : null,
      timeEntries: Array.isArray(ticket.timeEntries)
        ? (ticket.timeEntries as unknown as TimeEntry[]).map((entry) => ({
            ...entry,
            start: new Date(entry.start as unknown as string),
            end: new Date(entry.end as unknown as string),
          }))
        : [],
    }));
  }

  return deserialized;
}

export function validateBoardData(data: unknown): data is SerializedBoardData {
  if (!data || typeof data !== "object" || data === null) return false;

  const obj = data as Record<string, unknown>;
  if (typeof obj.version !== "number") return false;
  if (!obj.data || typeof obj.data !== "object") return false;

  // Validate board structure
  for (const [, tickets] of Object.entries(obj.data as Record<string, unknown>)) {
    if (!Array.isArray(tickets)) return false;

    for (const ticket of tickets) {
      if (!isValidTicket(ticket)) return false;
    }
  }

  return true;
}

function isValidTicket(ticket: unknown): ticket is Ticket {
  if (!ticket || typeof ticket !== "object" || ticket === null) return false;

  const t = ticket as Record<string, unknown>;

  // Validate subTasks if present
  const hasValidSubTasks =
    t.subTasks === undefined ||
    (Array.isArray(t.subTasks) &&
     t.subTasks.every((st: unknown) => {
       if (!st || typeof st !== "object") return false;
       const subTask = st as Record<string, unknown>;
       return (
         typeof subTask.id === "string" &&
         typeof subTask.text === "string" &&
         typeof subTask.completed === "boolean"
       );
     }));

  const hasValidTimeEntries =
    t.timeEntries === undefined ||
    (Array.isArray(t.timeEntries) &&
      t.timeEntries.every((entry: unknown) => {
        if (!entry || typeof entry !== "object") return false;
        const timeEntry = entry as Record<string, unknown>;
        return (
          typeof timeEntry.duration === "number" &&
          (timeEntry.start instanceof Date ||
            typeof timeEntry.start === "string") &&
          (timeEntry.end instanceof Date || typeof timeEntry.end === "string")
        );
      }));

  return (
    typeof t.id === "string" &&
    typeof t.title === "string" &&
    typeof t.description === "string" &&
    typeof t.status === "string" &&
    (t.projectId === undefined || typeof t.projectId === "string") &&
    hasValidSubTasks &&
    (t.duration === undefined || typeof t.duration === "number") &&
    (t.completedAt === undefined ||
      t.completedAt === null ||
      t.completedAt instanceof Date ||
      typeof t.completedAt === "string") &&
    hasValidTimeEntries &&
    (t.createdAt instanceof Date ||
      typeof t.createdAt === "string") &&
    (t.updatedAt instanceof Date || typeof t.updatedAt === "string")
  );
}

export function exportBoardAsJson(boardState: BoardState): string {
  return serializeBoardData(boardState);
}

export function importBoardFromJson(jsonData: string): BoardState {
  const parsed = JSON.parse(jsonData);

  if (!validateBoardData(parsed)) {
    throw new Error("Invalid board data format");
  }

  return deserializeBoardData(jsonData);
}

export function downloadJsonFile(data: string, filename: string): void {
  if (typeof window === "undefined") return;

  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
}

// ============================================================================
// Board Storage Helper Functions
// ============================================================================

export function getInitialSerializedBoard(): string {
  return serializeBoardData(INITIAL_BOARD_STATE);
}

export function safelyDeserializeBoard(raw: string | null | undefined): BoardState {
  if (!raw) {
    return INITIAL_BOARD_STATE;
  }

  try {
    return deserializeBoardData(raw);
  } catch {
    return INITIAL_BOARD_STATE;
  }
}

// ============================================================================
// Timer Utility Functions
// ============================================================================

/**
 * Formats duration in seconds to a readable time string
 *
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "12:34" for 12 min 34 sec or "1:23:45" for 1 hour 23 min 45 sec)
 *
 * @example
 * formatDuration(0) // "0:00"
 * formatDuration(65) // "1:05"
 * formatDuration(3661) // "1:01:01"
 */
export function formatDuration(seconds: number): string {
  if (seconds < 0) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Records the final duration to a ticket in the board state
 *
 * Uses functional state update to avoid race conditions with concurrent board updates.
 *
 * @param ticketId - ID of the ticket to update
 * @param duration - Duration in seconds to record
 * @param setBoard - Board state setter function (functional update)
 */
export function recordDuration(
  ticketId: string,
  duration: number,
  setBoard: (updater: (board: BoardState) => BoardState) => void
): void {
  if (duration <= 0) {
    setBoard((currentBoard) => {
      const updatedBoard = { ...currentBoard };

      for (const [columnId, tickets] of Object.entries(updatedBoard)) {
        const ticketIndex = tickets.findIndex((t) => t.id === ticketId);
        if (ticketIndex !== -1) {
          const updatedTickets = [...tickets];
          const ticket = updatedTickets[ticketIndex];
          const now = new Date();
          updatedTickets[ticketIndex] = {
            ...ticket,
            completedAt: now,
            updatedAt: now,
          };
          updatedBoard[columnId] = updatedTickets;
          return updatedBoard;
        }
      }

      return currentBoard;
    });
    return;
  }

  setBoard((currentBoard) => {
    const updatedBoard = { ...currentBoard };

    // Find the ticket and update its duration
    for (const [columnId, tickets] of Object.entries(updatedBoard)) {
      const ticketIndex = tickets.findIndex((t) => t.id === ticketId);
      if (ticketIndex !== -1) {
        const updatedTickets = [...tickets];
        const ticket = updatedTickets[ticketIndex];
        const now = new Date();
        const normalizedDuration = Math.max(0, Math.round(duration));
        const totalDuration = (ticket.duration || 0) + normalizedDuration;
        const sessionStart = new Date(now.getTime() - normalizedDuration * 1000);
        const nextTimeEntries: TimeEntry[] = [
          ...(ticket.timeEntries ?? []),
          {
            start: sessionStart,
            end: now,
            duration: normalizedDuration,
          },
        ];

        updatedTickets[ticketIndex] = {
          ...ticket,
          duration: totalDuration,
          timeEntries: nextTimeEntries,
          completedAt: now,
          updatedAt: now,
        };
        updatedBoard[columnId] = updatedTickets;
        return updatedBoard;
      }
    }

    // Ticket not found, return unchanged board
    return currentBoard;
  });
}

/**
 * Resets the timer and clears the duration for a ticket
 *
 * Uses functional state update to avoid race conditions with concurrent board updates.
 *
 * @param ticketId - ID of the ticket to reset
 * @param stopWatchStore - Zustand stopwatch store instance
 * @param setBoard - Board state setter function (functional update)
 */
export function resetTimerForTicket(
  ticketId: string,
  stopWatchStore: StopWatchStore,
  setBoard: (updater: (board: BoardState) => BoardState) => void
): void {
  // Reset timer in store
  stopWatchStore.resetTimer(ticketId);

  // Clear duration in board using functional update
  setBoard((currentBoard) => {
    const updatedBoard = { ...currentBoard };

    for (const [columnId, tickets] of Object.entries(updatedBoard)) {
      const ticketIndex = tickets.findIndex((t) => t.id === ticketId);
      if (ticketIndex !== -1) {
        const updatedTickets = [...tickets];
        updatedTickets[ticketIndex] = {
          ...updatedTickets[ticketIndex],
          duration: 0,
          timeEntries: [],
          completedAt: null,
          updatedAt: new Date(),
        };
        updatedBoard[columnId] = updatedTickets;
        return updatedBoard;
      }
    }

    // Ticket not found, return unchanged board
    return currentBoard;
  });
}

/**
 * Handles timer state changes triggered by ticket status transitions
 *
 * Uses functional state updates to avoid race conditions with concurrent board updates.
 *
 * Business rules:
 * - Moving to "complete" → record accumulated duration to ticket
 * - Moving to "backlog" or "to-do" → reset timer and clear duration
 * - Moving to "in-progress" → no automatic action (user must manually start timer)
 *
 * @param ticketId - ID of the ticket whose status changed
 * @param oldStatus - Previous status
 * @param newStatus - New status
 * @param stopWatchStore - Zustand stopwatch store instance
 * @param setBoard - Board state setter function (functional update)
 */
export function handleTimerOnStatusChange(
  ticketId: string,
  oldStatus: ColumnId,
  newStatus: ColumnId,
  stopWatchStore: StopWatchStore,
  setBoard: (updater: (board: BoardState) => BoardState) => void
): void {
  // No change, nothing to do
  if (oldStatus === newStatus) return;

  const isTimerActive = stopWatchStore.isTimerActive(ticketId);

  // Case 1: Moving to "complete" - record duration
  if (newStatus === "complete") {
    if (isTimerActive) {
      const elapsedTime = stopWatchStore.getElapsedTime(ticketId);
      if (elapsedTime > 0) {
        recordDuration(ticketId, elapsedTime, setBoard);
      }
      stopWatchStore.stopTimer();
    }
  }

  // Case 2: Moving to "backlog" or "to-do" - reset timer
  else if (newStatus === "backlog" || newStatus === "to-do") {
    if (isTimerActive) {
      resetTimerForTicket(ticketId, stopWatchStore, setBoard);
    }
  }

  // Case 3: Moving away from "in-progress" (but not to complete/backlog/to-do)
  // This case is handled above, but included for clarity
  else if (oldStatus === "in-progress" && isTimerActive) {
    // Auto-stop timer when leaving in-progress
    stopWatchStore.stopTimer();
  }
}
