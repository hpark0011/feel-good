import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { CSSProperties } from "react";

interface UseTicketCardDragDropProps {
  ticketId: string;
}

interface UseTicketCardDragDropResult {
  /** Ref callback to attach to the draggable element */
  setNodeRef: (node: HTMLElement | null) => void;
  /** Inline styles for transform and transition */
  style: CSSProperties;
  /** Whether the card is currently being dragged */
  isDragging: boolean;
  /** Props to spread on the drag handle (attributes + listeners) */
  dragHandleProps: Record<string, unknown>;
}

/**
 * Encapsulates drag-and-drop functionality for ticket cards using @dnd-kit.
 *
 * Handles the sortable integration, transform styling, and opacity changes
 * during drag operations.
 *
 * @param props.ticketId - The unique identifier for the ticket
 * @returns Object containing ref, style, drag state, and handle props
 *
 * @example
 * const { setNodeRef, style, isDragging, dragHandleProps } =
 *   useTicketCardDragDrop({ ticketId: ticket.id });
 *
 * <div ref={setNodeRef} style={style} {...dragHandleProps}>
 *   {content}
 * </div>
 */
export function useTicketCardDragDrop({
  ticketId,
}: UseTicketCardDragDropProps): UseTicketCardDragDropResult {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticketId });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? transition : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return {
    setNodeRef,
    style,
    isDragging,
    dragHandleProps: { ...attributes, ...listeners },
  };
}
