"use client";

import { memo } from "react";
import {
  type Control,
  Controller,
  type FieldArrayPath,
  type FieldPath,
  useWatch,
} from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import type { TicketFormInput } from "@/app/(protected)/dashboard/tasks/_hooks";
import { cn } from "@/lib/utils";
import { SubTasksListItem } from "./sub-tasks-list-item";

interface SubTasksRowProps {
  control: Control<TicketFormInput>;
  name: FieldArrayPath<TicketFormInput>;
  index: number;
  remove: (index?: number | number[]) => void;
}

/**
 * Individual subtask row for form variant.
 * Integrates with React Hook Form for state management.
 */
export const SubTasksRow = memo(function SubTasksRow({
  control,
  name,
  index,
  remove,
}: SubTasksRowProps) {
  const textFieldName = `${name}.${index}.text` as FieldPath<TicketFormInput>;
  const completedFieldName =
    `${name}.${index}.completed` as FieldPath<TicketFormInput>;

  const completed = useWatch<TicketFormInput>({
    control,
    name: completedFieldName,
  }) as boolean | undefined;

  return (
    <SubTasksListItem>
      <Controller
        name={completedFieldName}
        control={control}
        render={({ field }) => (
          <Checkbox
            checked={!!field.value}
            onCheckedChange={(checked) => field.onChange(!!checked)}
            className='border-border-medium'
          />
        )}
      />
      <Controller
        name={textFieldName}
        control={control}
        render={({ field }) => {
          const { value, onChange, ...rest } = field;
          const stringValue = typeof value === "string" ? value : "";

          return (
            <Input
              {...rest}
              value={stringValue}
              onChange={(e) => onChange(e.target.value)}
              className={cn(
                "flex-1 border-none bg-transparent p-0 focus-visible:ring-0 h-5 hover:bg-transparent",
                completed && "line-through text-text-muted"
              )}
            />
          );
        }}
      />
      <span
        aria-hidden='true'
        className='pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-dialog via-dialog/90 to-transparent group-hover/subtask:from-hover group-hover/subtask:via-hover group-hover/subtask:to-transparent z-10'
      />
      <div className='absolute top-1/2 -translate-y-1/2 z-20 flex items-center justify-end bg-gradient-to-r from-transparent via-dialog group-hover/subtask:via-hover group-hover/subtask:to-hover to-dialog pl-0 group-hover/subtask:pl-2 h-5 right-0'>
        <Button
          type='button'
          variant='icon'
          size='sm'
          onClick={() => remove(index)}
          className='text-icon-light hover:text-icon-primary bg-gradient-to-r from-transparent via-hover to-hover h-5 hover:text-blue-500 opacity-0 group-hover/subtask:opacity-100  rounded-none'
        >
          <Icon name='XmarkIcon' className='size-3.5' />
        </Button>
      </div>
    </SubTasksListItem>
  );
});

SubTasksRow.displayName = "SubTasksRow";
