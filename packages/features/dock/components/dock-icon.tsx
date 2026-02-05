"use client";

import type { ComponentType } from "react";

import { cn } from "@feel-good/ui/lib/utils";
import React from "react";

export interface DockIconProps {
  icon: ComponentType<{ className?: string }>;
  isActive?: boolean;
  className?: string;
}

export function DockIcon({ icon: Icon, isActive, className }: DockIconProps) {
  return (
    <div
      data-slot="dock-icon"
      data-active={isActive}
      className={cn(
        "size-12 p-2",
        "[corner-shape:superellipse(1.1)] rounded-xl",
        "bg-muted/50",
        "flex items-center justify-center",
        "transition-all duration-100",
        "hover:bg-muted",
        "active:scale-97",
        isActive && "bg-primary/10 ring-2 ring-primary/20",
        className,
      )}
    >
      <Icon className="size-7" />
    </div>
  );
}
