import type React from "react";
import { cn } from "@/lib/utils";

type SubTasksListRootProps = React.ComponentProps<"div">;

/**
 * Root container for subtasks list.
 * Provides hover states and layout structure.
 */
export function SubTasksListRoot({
  className,
  ...props
}: SubTasksListRootProps) {
  return (
    <div
      data-slot='subtasks-list'
      className={cn(
        "group hover:bg-hover/30 flex flex-col overflow-hidden",
        className
      )}
      {...props}
    />
  );
}
