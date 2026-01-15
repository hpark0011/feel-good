import type { MouseEvent } from "react";
import { useCallback, useRef, useEffect } from "react";

interface UseTicketCardClickProps {
  /** Whether the card is currently being dragged */
  isDragging: boolean;
  /** Callback to invoke when card is clicked (not on buttons or sub-task area) */
  onClick?: () => void;
}

/**
 * Creates a click handler for ticket cards that filters out clicks on
 * interactive elements (buttons) and the sub-task editing area.
 *
 * Uses ref pattern to maintain fresh callback reference without
 * causing re-renders.
 *
 * @param props.isDragging - Whether drag operation is in progress
 * @param props.onClick - Callback for valid card clicks
 * @returns Memoized click handler function
 *
 * @example
 * const handleClick = useTicketCardClick({
 *   isDragging: isSortableDragging,
 *   onClick: () => openTicketDetail(ticket.id),
 * });
 *
 * <div onClick={handleClick}>{content}</div>
 */
export function useTicketCardClick({
  isDragging,
  onClick,
}: UseTicketCardClickProps): (e: MouseEvent) => void {
  // Store callback in ref to avoid dependency array issues
  const onClickRef = useRef(onClick);

  useEffect(() => {
    onClickRef.current = onClick;
  }, [onClick]);

  return useCallback(
    (e: MouseEvent) => {
      if (isDragging || !onClickRef.current) return;

      const target = e.target as HTMLElement;
      const isButton = target.closest("button");
      const isSubTaskArea = target.closest('[data-subtasks-area="true"]');

      if (!isButton && !isSubTaskArea) {
        onClickRef.current();
      }
    },
    [isDragging]
  );
}
