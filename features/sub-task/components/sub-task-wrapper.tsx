import type React from "react";
import { cn } from "@/lib/utils";

type SubTaskWrapperProps = React.ComponentProps<"div">;

/**
 * Sub-task wrapper container.
 * Provides layout and hover states.
 */
export function SubTaskWrapper({ className, ...props }: SubTaskWrapperProps) {
  return (
    <div
      data-slot='sub-task-wrapper'
      className={cn(
        "relative",
        "flex",
        "items-center",
        "gap-2",
        "pl-2 pr-1",
        "group/sub-task",
        "hover:bg-hover",
        className
      )}
      {...props}
    />
  );
}
