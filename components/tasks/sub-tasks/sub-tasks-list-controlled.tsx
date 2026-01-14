"use client";

import { useRef, useState } from "react";
import { SubTasksControlledRow } from "./sub-tasks-controlled-row";
import { SubTasksListAddItem } from "./sub-tasks-list-add-item";
import { SubTasksListHeader } from "./sub-tasks-list-header";
import { SubTasksListRoot } from "./sub-tasks-list-root";
import type { SubTask } from "./sub-tasks.types";

interface SubTasksListControlledProps {
  subTasks: SubTask[];
  onToggle: (id: string) => void;
  onTextChange?: (id: string, text: string) => void;
  onDelete?: (id: string) => void;
  onAdd?: (text: string) => void;
  readOnly?: boolean;
}

/**
 * Controlled variant of subtasks list.
 * State is managed externally via props.
 */
export function SubTasksListControlled({
  subTasks,
  onToggle,
  onTextChange,
  onDelete,
  onAdd,
  readOnly = false,
}: SubTasksListControlledProps) {
  const [newTaskText, setNewTaskText] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleAdd = () => {
    if (!onAdd) return;
    const trimmed = newTaskText.trim();
    if (!trimmed) {
      inputRef.current?.focus();
      return;
    }

    onAdd(trimmed);
    setNewTaskText("");
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const completedCount = subTasks.filter((task) => task?.completed).length;
  const totalCount = subTasks.length;

  return (
    <SubTasksListRoot>
      <SubTasksListHeader completed={completedCount} total={totalCount} />
      <div className='flex flex-col w-full'>
        {subTasks.map((subTask) => (
          <SubTasksControlledRow
            key={subTask.id}
            subTask={subTask}
            onToggle={() => onToggle(subTask.id)}
            onTextChange={
              onTextChange
                ? (value) => onTextChange(subTask.id, value)
                : undefined
            }
            onDelete={onDelete ? () => onDelete(subTask.id) : undefined}
            readOnly={readOnly}
          />
        ))}
      </div>
      {!readOnly && onAdd && (
        <SubTasksListAddItem
          inputRef={inputRef}
          value={newTaskText}
          onChange={setNewTaskText}
          onSubmit={handleAdd}
        />
      )}
    </SubTasksListRoot>
  );
}
