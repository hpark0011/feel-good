"use client";

import { HeaderContainer } from "@/components/header/header-ui";
import { InsightsDialog } from "@/features/insights";
import { useStopWatchStore } from "@/features/timer";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTodayFocus } from "../_hooks";
import { FocusFormDialog } from "./focus-form-dialog";
import { TasksHeaderActions } from "./tasks-header-actions";
import { TasksHeaderFocusDisplay } from "./tasks-header-focus-display";
import { TasksHeaderLogo } from "./tasks-header-logo";

export function TasksHeader() {
  const [focusDialogOpen, setFocusDialogOpen] = useState(false);
  const [insightsDialogOpen, setInsightsDialogOpen] = useState(false);
  const [todayFocus, setTodayFocus] = useTodayFocus();
  const { resolvedTheme, setTheme } = useTheme();

  const hydrate = useStopWatchStore((state) => state._hydrate);

  // Hydrate timer state from localStorage after mount (prevents hydration errors)
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handleThemeToggle = () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <HeaderContainer className="grid grid-cols-3 items-center">
      <div className="flex items-center justify-start">
        <TasksHeaderLogo
          onThemeToggle={handleThemeToggle}
        />
      </div>
      <div className="flex items-center justify-center">
        <TasksHeaderFocusDisplay
          todayFocus={todayFocus}
          onClick={() => setFocusDialogOpen(true)}
        />
      </div>
      <div className="flex items-center justify-end">
        <TasksHeaderActions
          onInsightsClick={() => setInsightsDialogOpen(true)}
        />
      </div>
      <FocusFormDialog
        open={focusDialogOpen}
        onOpenChange={setFocusDialogOpen}
        onSubmit={(data) => {
          setTodayFocus(data.focus);
          setFocusDialogOpen(false);
        }}
        defaultValue={todayFocus}
      />
      <InsightsDialog
        open={insightsDialogOpen}
        onOpenChange={setInsightsDialogOpen}
      />
    </HeaderContainer>
  );
}
