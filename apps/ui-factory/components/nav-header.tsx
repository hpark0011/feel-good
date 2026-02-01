"use client";

import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { SidebarTrigger, useSidebar } from "@feel-good/ui/primitives/sidebar";

export function NavHeader() {
  const { state, isMobile } = useSidebar();

  // Shift header right when sidebar is expanded on desktop; keep at left edge on mobile or when collapsed
  const leftPosition = !isMobile && state === "expanded"
    ? "var(--sidebar-width)"
    : 0;

  return (
    <header
      className="fixed top-0 right-0 z-10 flex h-12 items-center gap-2 pl-3 pr-4 transition-[left] duration-200 ease-linear"
      style={{
        left: leftPosition,
      }}
    >
      <SidebarTrigger />
      <div className="flex-1" />
      <ThemeToggleButton />
    </header>
  );
}
