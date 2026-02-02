import * as React from "react";

import { cn } from "../lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // Layout & Sizing
        "h-9 w-full min-w-0 px-3 py-1",
        // Shape
        "rounded-lg",
        // Background & Colors
        "bg-transparent dark:bg-input/30 border border-input hover:bg-accent hover:border-accent",
        // Text & Typography
        "text-base md:text-sm placeholder:text-muted-foreground",
        "selection:bg-primary selection:text-primary-foreground",
        // File Input Styles
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        // Interactive States
        "outline-none transition-[color,box-shadow]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // Focus States
        "focus-visible:border-ring/50 focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        // Invalid States
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
