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
 * Handles absolute positioning, transform, layout, sizing, and spacing.
 * Positions content at the right edge of the row, vertically centered.
 */
export function SubTaskFadeOverlayPosition({
  children,
  className,
}: SubTaskFadeOverlayPositionProps) {
  return (
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
        className
      )}
    >
      {children}
    </div>
  );
}
