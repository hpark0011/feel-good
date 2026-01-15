// Components
export { Board } from "./components/board";
export { BoardColumn } from "./components/board-column";
export type { BoardHandle } from "./components/board";

// Hooks
export { useBoardState } from "./hooks/use-board-state";
export type { UseBoardStateReturn } from "./hooks/use-board-state";
export { useBoardDnd } from "./hooks/use-board-dnd";
export type { UseBoardDndOptions, UseBoardDndReturn } from "./hooks/use-board-dnd";
export { useBoardForm } from "./hooks/use-board-form";
export type {
  UseBoardFormOptions,
  UseBoardFormReturn,
  TicketFormValues,
} from "./hooks/use-board-form";

// Types (re-exported from central location)
export type {
  BoardState,
  Ticket,
  SubTask,
  Column,
  ColumnId,
} from "./types";

// Utils (for advanced usage)
export {
  BOARD_STORAGE_KEY,
  serializeBoardData,
  deserializeBoardData,
  getInitialSerializedBoard,
  safelyDeserializeBoard,
} from "./utils/board-storage.utils";
export { importBoardFromJson, downloadJsonFile } from "./utils/board-io.utils";
export {
  formatDuration,
  handleTimerOnStatusChange,
} from "./utils/board-timer.utils";
