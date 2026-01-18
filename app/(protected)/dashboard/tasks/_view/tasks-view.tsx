"use client";

import { LayoutModeProvider, TasksBody } from "@/features/kanban-board";
import { TasksHeader } from "../_components/tasks-header";

export function TasksView() {
  return (
    <LayoutModeProvider>
      <TasksHeader />
      <TasksBody />
    </LayoutModeProvider>
  );
}
