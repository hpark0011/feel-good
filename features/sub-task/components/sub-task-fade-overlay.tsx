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
 * Uses --sub-task-bg CSS variable to match parent/row background contextually.
 */
export function SubTaskFadeOverlay({
  children,
  className,
}: SubTaskFadeOverlayProps) {
  return (
    <div
      className={cn(
        // Sizing - match input height
        "h-5",
        // Layout - center content vertically
        "flex items-center",
        // Background - gradient fade using CSS variable for contextual awareness
        "bg-gradient-to-r from-transparent via-[var(--sub-task-bg)] to-[var(--sub-task-bg)]",
        className
      )}
    >
      {children}
    </div>
  );
}
