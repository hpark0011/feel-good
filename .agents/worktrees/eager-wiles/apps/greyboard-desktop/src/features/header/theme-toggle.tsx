import { Icon } from "@feel-good/ui/components/icon";
import { Switch } from "@feel-good/ui/primitives/switch";

import { useTheme } from "@/src/hooks/use-theme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="no-drag flex items-center gap-1">
      <div className="-mr-0.5">
        <Icon name="SunMaxFillIcon" className="size-5 text-icon" />
      </div>
      <Switch
        checked={theme === "dark"}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        variant="theme"
        aria-label="Toggle dark mode"
        size="sm"
      />
      <div className="flex size-4.5 items-center justify-center">
        <Icon name="MoonFillIcon" className="size-4 text-icon" />
      </div>
    </div>
  );
}
