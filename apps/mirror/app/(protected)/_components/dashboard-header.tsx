import { ThemeToggleButton } from "@feel-good/features/theme/components";

export function DashboardHeader() {
  return (
    <header className="fixed top-0 right-0 z-10 flex h-12 items-center gap-2 pl-3 pr-4 transition-[left] duration-200 ease-linear">
      <ThemeToggleButton />
    </header>
  );
}
