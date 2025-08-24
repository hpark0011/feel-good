export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: ColumnId;
  createdAt: Date;
  updatedAt: Date;
}

export interface Column {
  id: ColumnId;
  title: string;
}

export type BoardState = Record<string, Ticket[]>;

export type ColumnId = "backlog" | "not-started" | "in-progress" | "complete";
