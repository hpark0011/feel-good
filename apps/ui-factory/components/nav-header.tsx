import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { SidebarTrigger } from "@feel-good/ui/primitives/sidebar";

export function NavHeader() {
  return (
    <header className="flex items-center gap-2 h-12 px-4 border-b border-border">
      <SidebarTrigger />
      <div className="flex-1" />
      <ThemeToggleButton />
    </header>
  );
}
