"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import type React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useProjects } from "@/hooks/use-projects";
import { formatDuration } from "@/app/(protected)/dashboard/tasks/_lib/tasks.utils";
import { cn } from "@/lib/utils";
import { StopWatchState, useStopWatchStore } from "@/store/stop-watch-store";
import type { SubTask, Ticket } from "@/types/board.types";
import { SubTasksInlineEditor } from "../sub-tasks/sub-tasks-inline-editor";
import { cardVariants, statusStyles } from "./ticket-card.config";
import { ProjectTag } from "./project-tag";
import { TicketTimerButton } from "./ticket-timer-button";
import { TicketActionToolbar } from "./ticket-action-toolbar";

const MotionWrapper = motion.div;

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
  const { getProjectById } = useProjects();
  const project = ticket.projectId
    ? getProjectById(ticket.projectId)
    : undefined;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: ticket.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isSortableDragging ? transition : undefined,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const [isSubTaskEditorOpen, setIsSubTaskEditorOpen] = useState(
    (ticket.subTasks?.length ?? 0) > 0
  );

  const ticketSubTaskCount = ticket.subTasks?.length ?? 0;

  useEffect(() => {
    if (ticketSubTaskCount > 0) {
      setIsSubTaskEditorOpen(true);
    }
  }, [ticketSubTaskCount]);

  const cardWrapperClassName = cn(
    "relative scale-100 hover:scale-[1.02] transition-all duration-200 ease-out",
    isDragging && "rotate-5 scale-105"
  );

  const cardClassName = cn(
    "bg-card border-card-border hover:bg-base dark:hover:bg-neutral-900 relative border transition-all duration-200 translate-y-0 hover:translate-y-[-1px] ease-out group cursor-grab active:cursor-grabbing p-0 gap-0 hover:border-opacity-100 inset-shadow-none shadow-xs hover:shadow-[0_12px_12px_-6px_rgba(255,255,255,0.9),_0_14px_14px_-6px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_12px_12px_-6px_rgba(255,255,255,0.15),_0_14px_14px_-6px_rgba(0,0,0,0.9)] relative rounded-[12px]",
    statusStyles[ticket.status]
  );

  const handleClick = (e: React.MouseEvent) => {
    if (!isSortableDragging && onClick) {
      const target = e.target as HTMLElement;
      const isButton = target.closest("button");
      const isSubTaskArea = target.closest('[data-subtasks-area="true"]');

      if (!isButton && !isSubTaskArea) {
        onClick();
      }
    }
  };

  // Check if this specific ticket has an active timer (reactive selectors)
  const timerState = useStopWatchStore((state) =>
    state.getTimerState(ticket.id)
  );

  const stopSubTaskAreaPropagation = (
    event: React.SyntheticEvent<Element, Event>
  ) => {
    event.stopPropagation();
  };

  const durationInSeconds =
    ticket.status === "complete" &&
    typeof ticket.duration === "number" &&
    ticket.duration > 0
      ? ticket.duration
      : null;

  const durationLabel =
    durationInSeconds !== null ? formatDuration(durationInSeconds) : null;

  const cardContent = (
    <>
      <CardHeader
        className={cn(
          "p-2.5 py-2 flex",
          (ticket.description || isSubTaskEditorOpen) && "pb-2 h-fit"
        )}
      >
        <div className='flex items-center gap-1.5'>
          <div className='flex-1 min-w-0 flex items-start'>
            <CardTitle
              className={cn(
                "text-[14px] font-medium leading-[1.2] relative gap-[1px] flex",
                durationLabel && "block"
              )}
            >
              {ticket.status === "in-progress" && (
                <TicketTimerButton
                  ticketId={ticket.id}
                  ticketTitle={ticket.title}
                  timerState={timerState}
                />
              )}
              {durationLabel && (
                <span className='inline-flex items-center text-orange-300 text-[11px] mr-[5px] relative bottom-[1px] '>
                  <span className='font-mono'>{durationLabel}</span>
                </span>
              )}

              <span>{ticket.title}</span>
            </CardTitle>
          </div>
          <TicketActionToolbar
            isDragging={isDragging}
            isSubTaskEditorOpen={isSubTaskEditorOpen}
            onToggleSubTasks={() => setIsSubTaskEditorOpen((prev) => !prev)}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </CardHeader>

      {isSubTaskEditorOpen ? (
        <CardContent className='border-border-light mt-0.5 rounded-b-[11px] p-0 overflow-hidden bg-[#f1f1f2] dark:bg-[#0F0F0F] '>
          <div
            data-subtasks-area='true'
            onPointerDown={stopSubTaskAreaPropagation}
            onPointerUp={stopSubTaskAreaPropagation}
          >
            <SubTasksInlineEditor
              initialSubTasks={ticket.subTasks ?? []}
              onSave={(updated) => {
                if (!isDragging) {
                  onSubTasksChange?.(updated);
                }
              }}
            />
          </div>
        </CardContent>
      ) : (
        ticket.description && (
          <CardContent className='p-2.5 pt-0'>
            <p className='text-sm line-clamp-6 w-full leading-[120%] text-text-tertiary whitespace-pre-wrap'>
              {ticket.description}
            </p>
          </CardContent>
        )
      )}
    </>
  );

  const commonWrapperProps = {
    ref: setNodeRef,
    style,
    className: cardWrapperClassName,
    onClick: handleClick,
    ...attributes,
    ...listeners,
  } as const;

  // Only use animated card for initial load
  if (isInitialLoad && !isSortableDragging) {
    return (
      <MotionWrapper
        variants={cardVariants}
        initial='hidden'
        animate='visible'
        custom={index}
        {...commonWrapperProps}
      >
        <ProjectTag project={project} isDragging={isDragging} />
        <Card className={cardClassName}>{cardContent}</Card>
      </MotionWrapper>
    );
  }

  // Regular non-animated card for all other cases
  return (
    <div {...commonWrapperProps}>
      <ProjectTag project={project} isDragging={isDragging} />
      <Card className={cardClassName}>{cardContent}</Card>
    </div>
  );
}
