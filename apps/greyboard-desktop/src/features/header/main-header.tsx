import { ThemeToggle } from "./theme-toggle";

export function MainHeader() {
  return (
    <header className="drag titlebar-padded flex h-12 items-center justify-end px-4">
      <ThemeToggle />
    </header>
  );
}
