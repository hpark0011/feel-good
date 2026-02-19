import { ThemeToggle } from "./theme-toggle";

export function MainHeader() {
  return (
    <header className="flex h-12 items-center justify-end px-4">
      <ThemeToggle />
    </header>
  );
}
