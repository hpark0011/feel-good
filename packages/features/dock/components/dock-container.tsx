"use client";

import type { ReactNode } from "react";

import { cn } from "@feel-good/utils/cn";

export interface DockContainerProps {
  children: ReactNode;
  isVisible?: boolean;
  className?: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function DockContainer({
  children,
  isVisible = true,
  className,
  onMouseEnter,
  onMouseLeave,
}: DockContainerProps) {
  return (
    <nav
      role="navigation"
      aria-label="App navigation"
      data-slot="dock-container"
      data-state={isVisible ? "visible" : "hidden"}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        // Position
        "fixed bottom-2 left-1/2 -translate-x-1/2",
        // Layout
        "flex items-center gap-2 px-3 py-2",
        // Appearance
        "bg-background/80 backdrop-blur-lg",
        // Border
        "border border-border/50 rounded-2xl shadow-lg",
        // Animation
        "transition-transform duration-300 ease-out",
        // Visibility
        isVisible ? "translate-y-0" : "translate-y-[calc(100%+16px)]",
        className,
      )}
    >
      {children}
    </nav>
  );
}
