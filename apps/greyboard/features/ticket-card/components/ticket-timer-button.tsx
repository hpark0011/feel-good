"use client";

import { Icon } from "@/components/ui/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { StopWatchState, useStopWatchStore } from "@/features/timer";

interface TicketTimerButtonProps {
  ticketId: string;
  ticketTitle: string;
  timerState: StopWatchState;
  onStartWork?: () => void;
}

/**
 * Play/pause timer button for in-progress and to-do tickets.
 *
 * When `onStartWork` is provided (to-do tickets), clicking calls it to move
 * the ticket to in-progress and start the timer in one action.
 * Otherwise, toggles the timer for in-progress tickets.
 */
export function TicketTimerButton({
  ticketId,
  ticketTitle,
  timerState,
  onStartWork,
}: TicketTimerButtonProps) {
  const tooltipLabel = onStartWork
    ? "Start Working"
    : timerState === StopWatchState.Running
      ? "Pause Timer"
      : "Start Timer";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type='button'
          className={cn(
            // Layout & Alignment
            "flex items-center justify-center",
            // Sizing
            "min-w-3.5 w-fit h-3.5",
            // Spacing
            "mr-[4px]",
            // Positioning
            "relative top-[1px] left-[-1px]",
            // Shape
            "rounded-[5px]",
            // Background
            "bg-neutral-50 dark:bg-neutral-900",
            // Shadow
            "shadow-[0_4px_12px_-4px_rgba(0,0,0,0.6),_0_0_0_2px_rgba(0,0,0,0.1)]",
            "dark:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.6),_0_0_0_2px_rgba(255,255,255,0.1)]",
            // Interactive States
            "group-hover",
            // Conditional: Running state
            timerState === StopWatchState.Running && "pulse-shadow gap-0.5"
          )}
          onClick={() => {
            if (onStartWork) {
              onStartWork();
              return;
            }

            const { startTimer, pauseTimer } = useStopWatchStore.getState();

            if (timerState === StopWatchState.Running) {
              pauseTimer();
              return;
            }

            startTimer(ticketId, ticketTitle);
          }}
        >
          <Icon
            name={
              timerState === StopWatchState.Running
                ? "PauseFillIcon"
                : "PlayFillIcon"
            }
            className={cn(
              // Sizing
              "size-3 min-w-3",
              // Typography
              "text-icon-extra-light dark:text-neutral-500"
            )}
          />
        </button>
      </TooltipTrigger>
      <TooltipContent>{tooltipLabel}</TooltipContent>
    </Tooltip>
  );
}
