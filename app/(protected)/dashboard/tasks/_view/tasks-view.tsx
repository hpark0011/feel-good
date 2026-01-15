"use client";

import { useRef } from "react";
import { Board, type BoardHandle } from "@/features/kanban-board";
import { TasksHeader } from "../_components/tasks-header";

export function TasksView() {
  const boardRef = useRef<BoardHandle>(null);

  return (
    <>
      <TasksHeader
        onImport={(e) => boardRef.current?.importFromInput(e)}
        onExport={() => boardRef.current?.exportBoard()}
        onClear={() => boardRef.current?.clearBoard()}
      />
      <Board ref={boardRef} />
    </>
  );
}
