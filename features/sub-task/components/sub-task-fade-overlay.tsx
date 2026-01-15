"use client";

import { cn } from "@/lib/utils";
import type React from "react";

interface SubTaskFadeOverlayProps {
  /** Content to render inside the fade overlay */
  children: React.ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * Fade overlay component for sub-task rows.
 * Creates a gradient fade-out effect for overflowing text.
 * Reveals on hover within parent group/sub-task.
 */
export function SubTaskFadeOverlay({
  children,
  className,
}: SubTaskFadeOverlayProps) {
  return (
    <div
      className={cn(
        // Background - gradient fade
        "bg-gradient-to-r from-transparent via-dialog to-dialog",
        // Interactive states - hover background
        "group-hover/sub-task:via-hover group-hover/sub-task:to-hover",
        className
      )}
    >
      {children}
    </div>
  );
}
