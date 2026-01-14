"use client";

import { signOutAction } from "@/app/_actions/auth-actions";
import { customToast } from "@/components/custom-toast";
import {
  HeaderContainer,
  HeaderLogo,
  HeaderMenu,
} from "@/components/header/header-ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PATHS } from "@/config/paths.config";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useProjects } from "@/hooks/use-projects";
// import { useNavigation } from "@/hooks/use-navigation";
import { useTodayFocus } from "@/hooks/use-today-focus";
import {
  BOARD_STORAGE_KEY,
  getInitialSerializedBoard,
  safelyDeserializeBoard,
} from "@/lib/board-storage";
import { formatDuration } from "@/lib/timer-utils";
import { cn } from "@/lib/utils";
import { StopWatchState, useStopWatchStore } from "@/store/stop-watch-store";
import { FocusFormDialog } from "./focus-form-dialog";
import { InsightsDialog } from "./insights-dialog";
import { ProjectFilter } from "./project-filter";

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
  // const { getCurrentValue, handleNavigate, navItems } = useNavigation();
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
      <Breadcrumb>
        <BreadcrumbList className='items-center text-[14px] text-foreground sm:gap-0'>
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <BreadcrumbLink asChild>
                  <button
                    type='button'
                    aria-label='Open navigation menu'
                    className='bg-transparent p-0 m-0 border-none outline-none focus-visible:ring-2 focus-visible:ring-border-highlight rounded-full'
                  >
                    <HeaderLogo />
                  </button>
                </BreadcrumbLink>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='start'
                sideOffset={6}
                className='min-w-[160px] p-1'
              >
                <DropdownMenuItem
                  disabled={isSigningOut}
                  onSelect={() => {
                    if (!isSigningOut) {
                      handleSignOut();
                    }
                  }}
                >
                  <Icon name='HandWaveFillIcon' className='text-icon-light' />
                  Sign out
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleThemeToggle}>
                  <Icon
                    name='CircleLeftHalfFilledRightHalfStripedHorizontalIcon'
                    className='text-icon-light'
                  />
                  Toggle theme
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {!activeTicketId || timerState === "stopped" ? (
        <button
          type='button'
          onClick={() => setFocusDialogOpen(true)}
          className='bg-card shadow-xs border-border-highlight dark:border-white/2 border rounded-sm h-[24px] hover:bg-base  transition-all duration-200 ease-out cursor-pointer scale-100 absolute left-1/2 -translate-x-1/2 flex items-center translate-y-[0px] hover:translate-y-[-1px] hover:shadow-lg overflow-hidden text-[14px]'
        >
          <div className='text-text-muted font-medium px-2 h-full flex items-center'>
            {new Date().toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div className='w-px self-stretch mx-0 bg-border-light' />
          <span
            className={cn(
              "hover:bg-neutral-100 dark:hover:bg-neutral-700 px-2 h-full flex items-center dark:hover:text-white/70",
              todayFocus
                ? "text-text-primary font-medium"
                : "text-text-muted font-[480]"
            )}
          >
            {todayFocus || "Set today's focus"}
          </span>
        </button>
      ) : (
        <button
          type='button'
          className='bg-card shadow-xs border-border-highlight dark:border-white/2 border rounded-sm h-[24px] hover:bg-base transition-all duration-200 ease-out cursor-pointer scale-100 absolute left-1/2 -translate-x-1/2 flex items-center translate-y-[0px] hover:translate-y-[-1px] hover:shadow-lg overflow-hidden text-[14px] px-1 pr-2 gap-1 max-w-full'
        >
          <Icon
            name={
              timerState === StopWatchState.Paused
                ? "PlayFillIcon"
                : "PauseFillIcon"
            }
            className='size-3.5 text-icon-light'
          />
          <span className='text-[12px] font-mono text-orange-400 text-left pr-0.5 w-fit'>
            {formatDuration(activeElapsedSeconds)}
          </span>
          <div className='w-px self-stretch mx-1 bg-border-light' />
          <span
            className='max-w-[220px] truncate text-left'
            title={activeTicketTitle ?? undefined}
          >
            {activeTicketTitle || "Stop watch running"}
          </span>
        </button>
      )}
      <HeaderMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='icon'
              className='h-6 w-6 cursor-pointer rounded-[6px] gap-0.5'
              aria-label='Insights'
              onClick={() => setInsightsDialogOpen(true)}
            >
              <Icon
                name='WaveformPathEcgIcon'
                className='size-5.5 text-icon-light'
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Total focus time</TooltipContent>
        </Tooltip>

        <ProjectFilter />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='icon'
              className='h-6 w-6 cursor-pointer rounded-[6px]'
              aria-label='Board actions'
            >
              <Icon name='EllipsisIcon' className='size-4.5 text-icon-light' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end' className='w-[180px]'>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                fileInputRef.current?.click();
              }}
            >
              <Icon
                name='ArrowUpToLineCompactIcon'
                className='size-4.5 text-icon-light'
              />
              Import tasks
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(event) => {
                event.preventDefault();
                onExport();
              }}
            >
              <Icon
                name='ArrowDownToLineCompactIcon'
                className='size-4.5 text-icon-light'
              />
              Export tasks
            </DropdownMenuItem>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(event) => event.preventDefault()}
                  variant='destructive'
                >
                  <Icon
                    name='XmarkCircleFillIcon'
                    className='size-4.5 text-destructive'
                  />
                  Clear all board
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Board</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all tickets and reset the board
                    to empty state. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onClear}>
                    Clear Board
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </HeaderMenu>
      <input
        ref={fileInputRef}
        type='file'
        accept='.json'
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          onImport(e);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }}
        style={{ display: "none" }}
      />
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
