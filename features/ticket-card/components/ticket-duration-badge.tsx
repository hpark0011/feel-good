import { formatDuration } from "@/app/(protected)/dashboard/tasks/_utils";
import { cn } from "@/lib/utils";
import type { TicketStatus } from "@/types/board.types";

interface TicketDurationBadgeProps {
  status: TicketStatus;
  duration?: number;
}

/**
 * Displays the duration badge for completed tickets.
 *
 * Only renders when the ticket is complete and has a valid duration > 0.
 *
 * @param props.status - Current ticket status
 * @param props.duration - Duration in seconds
 * @returns Duration badge element or null
 */
export function TicketDurationBadge({
  status,
  duration,
}: TicketDurationBadgeProps) {
  // Only show duration for completed tickets with valid duration
  if (status !== "complete" || typeof duration !== "number" || duration <= 0) {
    return null;
  }

  const durationLabel = formatDuration(duration);

  return (
    <span
      className={cn(
        // Layout & Alignment
        "inline-flex items-center",
        // Spacing
        "mr-[5px]",
        // Positioning
        "relative bottom-[1px]",
        // Typography
        "text-[11px] text-orange-300"
      )}
    >
      <span className="font-mono">{durationLabel}</span>
    </span>
  );
}
