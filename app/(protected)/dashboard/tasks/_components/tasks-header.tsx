"use client";

import { signOutAction } from "@/app/_actions/auth-actions";
import { customToast } from "@/components/custom-toast";
import {
  HeaderContainer,
  HeaderMenu,
} from "@/components/header/header-ui";
import { PATHS } from "@/config/paths.config";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useProjects } from "@/hooks/use-projects";
import { useTodayFocus } from "@/hooks/use-today-focus";
import {
  BOARD_STORAGE_KEY,
  getInitialSerializedBoard,
  safelyDeserializeBoard,
} from "@/lib/board-storage";
import { useStopWatchStore } from "@/store/stop-watch-store";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { FocusFormDialog } from "./focus-form-dialog";
import { InsightsDialog } from "./insights-dialog";
import { TasksHeaderActions } from "./tasks-header-actions";
import { TasksHeaderFocusDisplay } from "./tasks-header-focus-display";
import { TasksHeaderLogo } from "./tasks-header-logo";
import { TasksHeaderTimerDisplay } from "./tasks-header-timer-display";

type HeaderProps = {
  onImport: (event: ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onClear: () => void;
};

export function TasksHeader({ onImport, onExport, onClear }: HeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [focusDialogOpen, setFocusDialogOpen] = useState(false);
  const [insightsDialogOpen, setInsightsDialogOpen] = useState(false);
  const [todayFocus, setTodayFocus] = useTodayFocus();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const [isSigningOut, startSignOutTransition] = useTransition();

  // Get board data and projects for insights
  const [rawBoard] = useLocalStorage<string>(
    BOARD_STORAGE_KEY,
    getInitialSerializedBoard()
  );
  const board = safelyDeserializeBoard(rawBoard);
  const allTickets = Object.values(board).flat();
  const { projects } = useProjects();
  const activeTicketId = useStopWatchStore((state) => state.activeTicketId);
  const activeTicketTitle = useStopWatchStore(
    (state) => state.activeTicketTitle
  );
  const timerState = useStopWatchStore((state) => state.state);
  const activeElapsedSeconds = useStopWatchStore((state) => {
    if (!state.activeTicketId) {
      return 0;
    }
    return state.getElapsedTime(state.activeTicketId);
  });
  const hydrate = useStopWatchStore((state) => state._hydrate);

  // Hydrate timer state from localStorage after mount (prevents hydration errors)
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const handleSignOut = () => {
    startSignOutTransition(async () => {
      const result = await signOutAction(undefined);

      if (result.success) {
        customToast({
          type: "success",
          title: "Signed out",
          description: "You have been signed out.",
        });
        router.push(PATHS.auth.signIn);
      } else {
        customToast({
          type: "error",
          title: "Sign out failed",
          description: result.message || "Please try again.",
        });
      }
    });
  };

  const handleThemeToggle = () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <HeaderContainer className='justify-between'>
      <TasksHeaderLogo
        onSignOut={handleSignOut}
        onThemeToggle={handleThemeToggle}
        isSigningOut={isSigningOut}
      />
      {!activeTicketId || timerState === "stopped" ? (
        <TasksHeaderFocusDisplay
          todayFocus={todayFocus}
          onClick={() => setFocusDialogOpen(true)}
        />
      ) : (
        <TasksHeaderTimerDisplay
          activeTicketId={activeTicketId}
          activeTicketTitle={activeTicketTitle}
          timerState={timerState}
          activeElapsedSeconds={activeElapsedSeconds}
        />
      )}
      <HeaderMenu>
        <TasksHeaderActions
          onImport={onImport}
          onExport={onExport}
          onClear={onClear}
          onInsightsClick={() => setInsightsDialogOpen(true)}
          fileInputRef={fileInputRef}
        />
      </HeaderMenu>
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
        tickets={allTickets}
        projects={projects}
      />
    </HeaderContainer>
  );
}
