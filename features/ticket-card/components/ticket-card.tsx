"use client";

import { Card } from "@/components/ui/card";
import { useProjects } from "@/hooks/use-projects";
import { useStopWatchStore } from "@/store/stop-watch-store";
import type { SubTask, Ticket } from "@/types/board.types";
import { useSubTaskEditorVisibility } from "../hooks/use-sub-task-editor-visibility";
import { useTicketCardClick } from "../hooks/use-ticket-card-click";
import { useTicketCardDragDrop } from "../hooks/use-ticket-card-drag-drop";
import { getCardClassName } from "../utils/ticket-card.config";
import { AnimatedTicketCardWrapper } from "./animated-ticket-card-wrapper";
import { TicketCardContent } from "./ticket-card-content";
import { TicketCardHeader } from "./ticket-card-header";
import { TicketProjectTag } from "./ticket-project-tag";

interface TicketCardProps {
  ticket: Ticket;
  isDragging?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
  index?: number;
  isInitialLoad?: boolean;
  onSubTasksChange?: (subTasks: SubTask[]) => void;
}

/**
 * Main ticket card component for the Kanban board.
 *
 * Orchestrates drag-and-drop, timer state, sub-task visibility,
 * and renders the card structure with header and content sections.
 */
export function TicketCard({
  ticket,
  isDragging = false,
  onEdit,
  onDelete,
  onClick,
  index = 0,
  isInitialLoad = false,
  onSubTasksChange,
}: TicketCardProps) {
  // Project lookup
  const { getProjectById } = useProjects();
  const project = ticket.projectId
    ? getProjectById(ticket.projectId)
    : undefined;

  // Drag-and-drop integration
  const {
    setNodeRef,
    style,
    isDragging: isSortableDragging,
    dragHandleProps,
  } = useTicketCardDragDrop({ ticketId: ticket.id });

  // Sub-task editor visibility
  const [isSubTaskEditorOpen, toggleSubTaskEditor] = useSubTaskEditorVisibility({
    subTaskCount: ticket.subTasks?.length ?? 0,
  });

  // Timer state for in-progress tickets
  const timerState = useStopWatchStore((state) =>
    state.getTimerState(ticket.id)
  );

  // Click handler with button/sub-task area exclusion
  const handleClick = useTicketCardClick({
    isDragging: isSortableDragging,
    onClick,
  });

  return (
    <AnimatedTicketCardWrapper
      isInitialLoad={isInitialLoad}
      isDragging={isSortableDragging}
      index={index}
      setNodeRef={setNodeRef}
      style={style}
      onClick={handleClick}
      dragHandleProps={dragHandleProps}
    >
      <TicketProjectTag project={project} isDragging={isDragging} />
      <Card className={getCardClassName(ticket.status)}>
        <TicketCardHeader
          ticket={ticket}
          timerState={timerState}
          isDragging={isDragging}
          isSubTaskEditorOpen={isSubTaskEditorOpen}
          onToggleSubTasks={toggleSubTaskEditor}
          onEdit={onEdit}
          onDelete={onDelete}
        />
        <TicketCardContent
          ticket={ticket}
          isSubTaskEditorOpen={isSubTaskEditorOpen}
          isDragging={isDragging}
          onSubTasksChange={onSubTasksChange}
        />
      </Card>
    </AnimatedTicketCardWrapper>
  );
}
