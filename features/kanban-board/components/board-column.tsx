"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { TicketCard } from "@/features/ticket-card";
import type { Column, SubTask, Ticket } from "@/types/board.types";
import { AddTicketButton } from "./add-ticket-button";
import { BoardColumnHeader } from "./board-column-header";

interface BoardColumnProps {
  column: Column;
  tickets: Ticket[];
  onAddTicket: () => void;
  onEditTicket: (ticket: Ticket) => void;
  onDeleteTicket: (ticketId: string) => void;
  onClearColumn?: () => void;
  onUpdateSubTasks: (ticketId: string, subTasks: SubTask[]) => void;
}

export function BoardColumn({
  column,
  tickets,
  onAddTicket,
  onEditTicket,
  onDeleteTicket,
  onClearColumn,
  onUpdateSubTasks,
}: BoardColumnProps) {
  const isMobile = useIsMobile();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsInitialLoad(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const { setNodeRef } = useDroppable({ id: column.id });

  return (
    <Card
      className={cn(
        // Mobile: full width, auto height, border bottom
        "w-full border-b border-neutral-200 dark:border-neutral-800",
        // Desktop: fixed column width, full height
        "md:w-1/4 md:h-[calc(100vh-80px)] md:border-b-0",
        // Shared
        "flex flex-col bg-transparent shadow-none rounded-none md:rounded-2xl py-0 gap-0 border-x-0 md:border-none"
      )}
    >
      <BoardColumnHeader
        column={column}
        ticketCount={tickets.length}
        onAddTicket={onAddTicket}
        onClearColumn={onClearColumn}
        isExpanded={isExpanded}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
      />
      <CardContent
        ref={setNodeRef}
        className={cn(
          "flex-1 p-0 px-4 overflow-hidden relative",
          // Mobile: collapsible (no animation - instant toggle)
          isMobile && !isExpanded && "max-h-0",
          isMobile && isExpanded && "max-h-none",
          // Desktop: always visible with scroll
          "md:max-h-none md:overflow-y-scroll"
        )}
      >
        <div className='h-6 w-full bg-gradient-to-t from-transparent to-background sticky top-0 left-0 z-10 hidden md:block' />

        <SortableContext
          id={column.id}
          items={tickets.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className='space-y-1.5 h-fit pb-4'>
            {tickets.map((ticket, index) => (
              <TicketCard
                key={ticket.id}
                ticket={ticket}
                index={index}
                isInitialLoad={isInitialLoad}
                onEdit={() => onEditTicket(ticket)}
                onDelete={() => onDeleteTicket(ticket.id)}
                onClick={() => onEditTicket(ticket)}
                onSubTasksChange={(subTasks: SubTask[]) =>
                  onUpdateSubTasks(ticket.id, subTasks)
                }
              />
            ))}
            {column.id !== "complete" && (
              <AddTicketButton onAddTicket={onAddTicket} />
            )}
          </div>
        </SortableContext>

        <div className='h-4 w-full bg-gradient-to-b from-transparent to-background fixed bottom-0 left-0 hidden md:block' />
      </CardContent>
    </Card>
  );
}
