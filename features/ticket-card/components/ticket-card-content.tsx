"use client";

import type { SyntheticEvent } from "react";
import { CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SubTask, Ticket } from "@/types/board.types";
import { SubTasksInlineEditor } from "../../sub-task-list/components/sub-tasks-inline-editor";
import { subTaskContainerStyles } from "../utils/ticket-card.config";

interface TicketCardContentProps {
  ticket: Ticket;
  isSubTaskEditorOpen: boolean;
  isDragging: boolean;
  onSubTasksChange?: (subTasks: SubTask[]) => void;
}

/**
 * Content section of a ticket card displaying either the sub-task editor
 * or the ticket description.
 */
export function TicketCardContent({
  ticket,
  isSubTaskEditorOpen,
  isDragging,
  onSubTasksChange,
}: TicketCardContentProps) {
  const stopSubTaskAreaPropagation = (event: SyntheticEvent<Element, Event>) => {
    event.stopPropagation();
  };

  // Sub-task editor takes precedence over description
  if (isSubTaskEditorOpen) {
    return (
      <CardContent className={subTaskContainerStyles}>
        <div
          data-subtasks-area="true"
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
    );
  }

  // Show description if no sub-task editor and description exists
  if (ticket.description) {
    return (
      <CardContent className="p-2.5 pt-0">
        <p
          className={cn(
            // Layout & Sizing
            "w-full line-clamp-6",
            // Typography
            "text-sm text-text-tertiary leading-[120%]",
            // Text Formatting
            "whitespace-pre-wrap"
          )}
        >
          {ticket.description}
        </p>
      </CardContent>
    );
  }

  return null;
}
