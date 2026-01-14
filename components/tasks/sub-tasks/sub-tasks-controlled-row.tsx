"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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
      {onDelete && !readOnly && (
        <>
          <span
            aria-hidden='true'
            className='pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-dialog via-dialog/90 to-transparent group-hover/subtask:from-hover group-hover/subtask:via-hover  group-hover/subtask:to-transparent z-10'
          />
          <div className='absolute top-1/2 -translate-y-1/2 z-20 flex items-center justify-end bg-gradient-to-r from-transparent via-dialog group-hover/subtask:via-hover group-hover/subtask:to-hover to-dialog pl-0 group-hover/subtask:pl-2 h-5 right-0'>
            <Button
              type='button'
              variant='icon'
              size='sm'
              onClick={onDelete}
              className='text-icon-light hover:text-icon-primary hover:bg-transparent hover:text-blue-500 opacity-0 group-hover/subtask:opacity-100'
            >
              <Icon name='XmarkIcon' className='size-3.5' />
            </Button>
          </div>
        </>
      )}
    </SubTasksListItem>
  );
});

SubTasksControlledRow.displayName = "SubTasksControlledRow";
