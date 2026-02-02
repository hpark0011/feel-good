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
        "bg-transparent dark:bg-input/30 border border-input hover:bg-accent hover:border-accent dark:hover:bg-accent dark:hover:border-accent",
        // Text & Typography
        "text-base md:text-sm placeholder:text-muted-foreground",
        "selection:bg-primary selection:text-primary-foreground",
        // File Input Styles
        "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
        // Interactive States
        "outline-none transition-[color,box-shadow]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        // Focus States
        "focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[3px]",
        // Invalid States
        "aria-invalid:border-input-destructive aria-invalid:ring-input-destructive aria-invalid:ring-[3px] dark:aria-invalid:ring-input-destructive dark:aria-invalid:border-input-destructive",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
