"use client";

import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProjectFilterClearButtonProps {
  onClick: () => void;
  className?: string;
}

/**
 * Clear button component for project filter.
 *
 * Used in both the trigger button and badges section to clear active filters.
 *
 * @param onClick - Handler function called when button is clicked
 * @param className - Optional additional CSS classes
 */
export function ProjectFilterClearButton({
  onClick,
  className,
}: ProjectFilterClearButtonProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "flex items-center justify-center transition-colors cursor-pointer px-1 group h-full hover:shadow-lg",
        className,
      )}
      aria-label="Clear filters"
    >
      <XIcon className="size-3.5 text-icon-light group-hover:text-blue-500" />
    </button>
  );
}
