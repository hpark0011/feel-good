"use client";

import { memo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SubTasksDeleteAction } from "./sub-tasks-delete-action";
import { SubTasksListItem } from "./sub-tasks-list-item";
import type { SubTask } from "./sub-tasks.types";

interface SubTasksControlledRowProps {
  subTask: SubTask;
  onToggle: () => void;
  onTextChange?: (value: string) => void;
  onDelete?: () => void;
  readOnly?: boolean;
}

/**
 * Individual subtask row for controlled variant.
 * Manages its own display state via props.
 */
export const SubTasksControlledRow = memo(function SubTasksControlledRow({
  subTask,
  onToggle,
  onTextChange,
  onDelete,
  readOnly = false,
}: SubTasksControlledRowProps) {
  return (
    <SubTasksListItem>
      <Checkbox
        checked={!!subTask.completed}
        onCheckedChange={() => {
          if (!readOnly) {
            onToggle();
          }
        }}
        className='border-border-medium'
        disabled={readOnly}
      />
      <Input
        value={subTask.text}
        onChange={(event) => onTextChange?.(event.target.value)}
        readOnly={readOnly || !onTextChange}
        className={cn(
          "flex-1 border-none bg-transparent p-0 focus-visible:ring-0 h-5 hover:bg-transparent",
          subTask.completed && "line-through text-text-muted",
          readOnly && "cursor-default"
        )}
      />
      {onDelete && !readOnly && <SubTasksDeleteAction onDelete={onDelete} />}
    </SubTasksListItem>
  );
});

SubTasksControlledRow.displayName = "SubTasksControlledRow";
