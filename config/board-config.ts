import { BoardState, ColumnId } from "@/types/board";

export const COLUMNS = [
  { id: "backlog" as ColumnId, title: "Backlog" },
  { id: "todo" as ColumnId, title: "Todo" },
  { id: "in-progress" as ColumnId, title: "In Progress" },
  { id: "done" as ColumnId, title: "Done" },
] as const;

export const INITIAL_BOARD_STATE: BoardState = {
  backlog: [],
  todo: [],
  "in-progress": [],
  done: [],
};
