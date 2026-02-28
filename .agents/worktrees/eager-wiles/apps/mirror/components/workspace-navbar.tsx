"use client";

import { ThemeToggleButton } from "@feel-good/features/theme/components";
import { cn } from "@feel-good/utils/cn";

type WorkspaceNavbarProps = {
  className?: string;
};

export function WorkspaceNavbar({ className }: WorkspaceNavbarProps) {
  return (
    <nav
      className={cn(
        "z-10 flex h-10 items-center justify-end gap-2 px-4 bg-linear-to-b from-background via-background/70 to-transparent",
        className,
      )}
    >
      <ThemeToggleButton />
    </nav>
  );
}
