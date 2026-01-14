"use client";

import { memo } from "react";
import {
  type Control,
  Controller,
  type FieldArrayPath,
  type FieldPath,
  useWatch,
} from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { TicketFormInput } from "@/app/(protected)/dashboard/tasks/_hooks";
import { cn } from "@/lib/utils";
import { SubTasksDeleteAction } from "./sub-tasks-delete-action";
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
      <SubTasksDeleteAction onDelete={() => remove(index)} />
    </SubTasksListItem>
  );
});

SubTasksRow.displayName = "SubTasksRow";
