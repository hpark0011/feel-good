"use client";

import { TasksBody } from "@/features/kanban-board";
import { TasksHeader } from "../_components/tasks-header";

export function TasksView() {
  return (
    <>
      <TasksHeader />
      <TasksBody />
    </>
  );
}
