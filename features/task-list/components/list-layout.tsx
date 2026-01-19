"use client";

import { cn } from "@/lib/utils";

interface ListLayoutProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Layout container for list view with vertical stacking.
 * Handles overflow scrolling and spacing for collapsible sections.
 */
export function ListLayout({ children, className }: ListLayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen pt-20",
        "flex flex-col overflow-y-auto px-4 gap-0",
        className
      )}
    >
      {children}
    </div>
  );
}
