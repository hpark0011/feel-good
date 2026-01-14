"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

interface SubTaskDeleteButtonProps {
  onDelete: () => void;
  className?: string;
}

/**
 * Delete button with gradient fade overlay.
 * Reveals on hover within parent group/subtask.
 */
export function SubTaskDeleteButton({
  onDelete,
  className,
}: SubTaskDeleteButtonProps) {
  return (
    <>
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
          "pl-0 group-hover/sub-task:pl-2",
          // Background - gradient fade
          "bg-gradient-to-r from-transparent via-dialog to-dialog",
          // Interactive states - hover background
          "group-hover/sub-task:via-hover group-hover/sub-task:to-hover",
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
            "opacity-0 group-hover/sub-task:opacity-100",
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
