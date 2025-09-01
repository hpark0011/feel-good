import { IconName } from "@/components/ui/icon";

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
  icon: IconName;
  iconColor: string;
  iconSize: string;
}

export type BoardState = Record<string, Ticket[]>;

export type ColumnId = "backlog" | "to-do" | "in-progress" | "complete";
