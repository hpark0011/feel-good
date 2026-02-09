"use client";

import { forwardRef } from "react";
import { cn } from "@feel-good/utils/cn";

type SheetContainerProps = {
  children: React.ReactNode;
  handleRef: React.RefObject<HTMLDivElement | null>;
  contentRef?: React.RefObject<HTMLDivElement | null>;
  isDragging: boolean;
  style?: React.CSSProperties;
  className?: string;
};

export const SheetContainer = forwardRef<HTMLDivElement, SheetContainerProps>(
  function SheetContainer({ children, handleRef, contentRef, isDragging, style, className }, ref) {
    return (
      <div
        ref={ref}
        role="region"
        aria-label="Articles"
        className={cn(
          "absolute inset-x-0 bottom-0 top-0 rounded-t-4xl bg-background border-t border-border-subtle",
          !isDragging && "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
          className,
        )}
        style={style}
      >
        {/* Drag handle */}
        <div
          ref={handleRef}
          className="flex items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
        >
          <div className="h-1.5 w-12 rounded-full bg-muted-foreground/20" />
        </div>

        {/* Scrollable content */}
        <div ref={contentRef} className="overflow-y-auto overscroll-y-contain h-[calc(100%-36px)]">
          {children}
        </div>
      </div>
    );
  },
);
