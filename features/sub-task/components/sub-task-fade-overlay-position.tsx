"use client";

import { cn } from "@/lib/utils";
import type React from "react";

interface SubTaskFadeOverlayPositionProps {
  /** Content to render inside the positioned container */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * Positioning wrapper for sub-task fade overlay.
 * Handles absolute positioning, layout, sizing, and spacing.
 * Positions content at the right edge of the row, vertically aligned with input.
 */
export function SubTaskFadeOverlayPosition({
  children,
  className,
}: SubTaskFadeOverlayPositionProps) {
  return (
    <div
      className={cn(
        // Positioning - fill vertical space and align to right
        "absolute inset-y-0 right-0 z-20",
        // Layout - center content vertically within the overlay
        "flex items-center justify-end",
        // Spacing
        "pl-0 group-hover/sub-task:pl-2",
        className
      )}
    >
      {children}
    </div>
  );
}
