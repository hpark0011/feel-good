"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface SubTasksDeleteActionProps {
  onDelete: () => void;
  className?: string;
}

/**
 * Delete action with gradient fade overlay.
 * Reveals on hover within parent group/subtask.
 */
export function SubTasksDeleteAction({
  onDelete,
  className,
}: SubTasksDeleteActionProps) {
  return (
    <>
      {/* Gradient fade overlay */}
      <span
        aria-hidden='true'
        className={cn(
          // Positioning
          "absolute inset-y-0 right-0 z-10",
          // Sizing
          "w-4",
          // Background - gradient fade
          "bg-gradient-to-l from-dialog via-dialog/90 to-transparent",
          // Interactive states - hover background
          "group-hover/subtask:from-hover group-hover/subtask:via-hover group-hover/subtask:to-transparent",
          // Behavior
          "pointer-events-none"
        )}
      />

      {/* Delete button container */}
      <div
        className={cn(
          // Positioning
          "absolute top-1/2 right-0 z-20",
          // Transform
          "-translate-y-1/2",
          // Layout
          "flex items-center justify-end",
          // Sizing
          "h-5",
          // Spacing
          "pl-0 group-hover/subtask:pl-2",
          // Background - gradient fade
          "bg-gradient-to-r from-transparent via-dialog to-dialog",
          // Interactive states - hover background
          "group-hover/subtask:via-hover group-hover/subtask:to-hover",
          className
        )}
      >
        <Button
          type='button'
          variant='icon'
          size='sm'
          onClick={onDelete}
          className={cn(
            // Sizing
            "h-5",
            // Shape
            "rounded-none",
            // Typography / Icon color
            "text-icon-light",
            // Visibility
            "opacity-0 group-hover/subtask:opacity-100",
            // Interactive states
            "hover:text-icon-primary hover:text-blue-500 hover:bg-transparent"
          )}
        >
          <Icon name='XmarkIcon' className='size-3.5' />
        </Button>
      </div>
    </>
  );
}
