"use client";

import type { TicketFormInput } from "@/app/(protected)/dashboard/tasks/_hooks";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { SubTask as SubTaskType } from "@/types/board.types";
import { memo } from "react";
import {
  type Control,
  Controller,
  type FieldArrayPath,
  type FieldPath,
  useWatch,
} from "react-hook-form";
import { SubTaskDeleteButton } from "./sub-task-delete-button";
import { SubTaskWrapper } from "./sub-task-wrapper";

interface SubTaskProps {
  control: Control<TicketFormInput>;
  name: FieldArrayPath<TicketFormInput>;
  index: number;
  remove: (index?: number | number[]) => void;
}

/**
 * Individual subtask row for form variant.
 * Integrates with React Hook Form for state management.
 */
export const SubTask = memo(function SubTask({
  control,
  name,
  index,
  remove,
}: SubTaskProps) {
  const textFieldName = `${name}.${index}.text` as FieldPath<TicketFormInput>;
  const completedFieldName =
    `${name}.${index}.completed` as FieldPath<TicketFormInput>;

  const completed = useWatch<TicketFormInput>({
    control,
    name: completedFieldName,
  }) as boolean | undefined;

  return (
    <SubTaskWrapper>
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
      <SubTaskDeleteButton onDelete={() => remove(index)} />
    </SubTaskWrapper>
  );
});

SubTask.displayName = "SubTask";
