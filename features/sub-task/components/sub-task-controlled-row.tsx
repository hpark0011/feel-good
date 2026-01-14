"use client";

import { memo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SubTaskDeleteButton } from "./sub-task-delete-button";
import { SubTaskWrapper } from "./sub-task-wrapper";
import type { SubTask as SubTaskType } from "@/types/board.types";

interface SubTasksControlledRowProps {
  subTask: SubTaskType;
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
    <SubTaskWrapper>
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
      {onDelete && !readOnly && <SubTaskDeleteButton onDelete={onDelete} />}
    </SubTaskWrapper>
  );
});

SubTasksControlledRow.displayName = "SubTasksControlledRow";
