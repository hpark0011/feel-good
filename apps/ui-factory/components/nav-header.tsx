import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { SidebarTrigger } from "@feel-good/ui/primitives/sidebar";

export function NavHeader() {
  return (
    <header className="fixed top-0 z-10 flex items-center gap-2 h-12 px-4 bg-red-500">
      <SidebarTrigger />
      <div className="flex-1" />
      <ThemeToggleButton />
    </header>
  );
}
