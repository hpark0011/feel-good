import { BoardState, ColumnId } from "@/types/board";

export const COLUMNS = [
  { id: "backlog" as ColumnId, title: "Backlog" },
  { id: "not-started" as ColumnId, title: "Not Started" },
  { id: "in-progress" as ColumnId, title: "In Progress" },
  { id: "complete" as ColumnId, title: "Complete" },
] as const;

export const INITIAL_BOARD_STATE: BoardState = {
  backlog: [],
  "not-started": [],
  "in-progress": [],
  complete: [],
};
