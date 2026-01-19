"use client";

import { LayoutModeProvider } from "@/features/kanban-board";
import { TasksHeader } from "../_components/tasks-header";
import { TasksBody } from "./tasks-body";

export function TasksView() {
  return (
    <LayoutModeProvider>
      <TasksHeader />
      <TasksBody />
    </LayoutModeProvider>
  );
}
