import type React from "react";
import { cn } from "@/lib/utils";

type SubTasksListItemProps = React.ComponentProps<"div">;

/**
 * Individual subtask item container.
 * Provides row layout and hover states.
 */
export function SubTasksListItem({
  className,
  ...props
}: SubTasksListItemProps) {
  return (
    <div
      data-slot='subtasks-list-item'
      className={cn(
        "relative flex items-center gap-2 group/subtask hover:bg-hover pl-2 pr-1",
        className
      )}
      {...props}
    />
  );
}
