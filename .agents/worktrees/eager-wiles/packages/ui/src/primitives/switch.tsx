"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/utils";

const switchVariants = cva(
  cn(
    // Layout
    "inline-flex shrink-0 items-center",
    // Background
    "data-[state=checked]:bg-switch-checked data-[state=unchecked]:bg-switch-unchecked dark:data-[state=unchecked]:bg-switch-unchecked",
    // Border
    "border border-transparent",
    // Interactive states
    "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
    // Transition & outline
    "transition-all outline-none",
    // Group & peer
    "group/switch peer",
  ),
  {
    variants: {
      variant: {
        default:
          "rounded-full hover:data-[state=unchecked]:bg-switch-unchecked-hover hover:data-[state=checked]:bg-switch-checked-hover",
        panel: cn(
          "rounded-sm data-[state=checked]:bg-switch-panel-checked",
          "hover:data-[state=unchecked]:bg-switch-panel-unchecked-hover hover:data-[state=checked]:bg-switch-panel-checked-hover",
        ),
        theme:
          "data-[state=checked]:bg-switch-theme-checked rounded-full hover:data-[state=unchecked]:bg-switch-theme-checked-hover hover:data-[state=checked]:bg-switch-theme-checked-hover",
      },
      size: {
        default: "h-[18px] w-8",
        sm: "h-3.5 w-6",
        panel: "h-[14px] w-4.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const switchThumbVariants = cva(
  cn(
    // Layout
    "block",
    // Background
    "bg-background dark:data-[state=unchecked]:bg-primary-foreground dark:data-[state=checked]:bg-primary-foreground",
    // Shadow
    "shadow-xs",
    // Sizing (via group)
    "group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3",
    // Positioning
    "data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0",
    // Interactive states
    "pointer-events-none",
    // Transition & ring
    "transition-transform ring-0",
  ),
  {
    variants: {
      variant: {
        default: "rounded-full",
        panel: cn(
          // Shape
          "rounded-[3px]",
          // Sizing
          "group-data-[size=default]/switch:w-[8px] group-data-[size=sm]/switch:w-[12px] group-data-[size=panel]/switch:w-[8px] group-data-[size=panel]/switch:h-[12px]",
          // Positioning
          "data-[state=checked]:translate-x-[calc(100%)]",
        ),
        theme: cn(
          "rounded-full",
        ),
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Switch({
  className,
  variant = "default",
  size = "default",
  ...props
}:
  & React.ComponentProps<typeof SwitchPrimitive.Root>
  & VariantProps<typeof switchVariants>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-variant={variant}
      data-size={size}
      className={cn(switchVariants({ variant, size }), className)}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(switchThumbVariants({ variant }))}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
