"use client";

import { cn } from "@feel-good/utils/cn";

type SheetContainerProps = {
  children: React.ReactNode;
  ref?: React.Ref<HTMLDivElement>;
  handleRef: React.RefObject<HTMLDivElement | null>;
  contentRef?: React.Ref<HTMLDivElement | null>;
  className?: string;
};

export function SheetContainer(
  { children, ref, handleRef, contentRef, className }: SheetContainerProps,
) {
  return (
    <div
      ref={ref}
      role="region"
      aria-label="Articles"
      className={cn(
        "absolute inset-x-0 bottom-0 top-[48px] [corner-shape:superellipse(1.1)] rounded-t-4xl bg-background border-t border-border-subtle",
        className,
      )}
    >
      {/* Drag handle */}
      <div
        ref={handleRef}
        className="flex items-center justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
      >
        <div className="h-1.5 w-12 rounded-full bg-muted-foreground/20" />
      </div>

      {/* Scrollable content */}
      <div
        ref={contentRef}
        className="overflow-y-auto overscroll-y-contain h-[calc(100%-36px)]"
      >
        {children}
      </div>
    </div>
  );
}
