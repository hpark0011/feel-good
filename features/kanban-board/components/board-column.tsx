"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  const handleTicketClick = (ticket: Ticket) => {
    onEditTicket(ticket);
  };

  return (
    <Card className="w-1/3 h-[calc(100vh-80px)] flex flex-col bg-transparent shadow-none rounded-2xl py-0 gap-0 border-none pb-0">
      <BoardColumnHeader
        column={column}
        ticketCount={tickets.length}
        onAddTicket={onAddTicket}
        onClearColumn={onClearColumn}
      />
      <CardContent
        ref={setNodeRef}
        className="flex-1 p-0 px-4 overflow-y-scroll relative"
      >
        <div className="h-6 w-full bg-gradient-to-t from-transparent to-background sticky top-0 left-0 z-10" />

        <SortableContext
          id={column.id}
          items={tickets.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1.5 h-fit pb-4">
            {tickets.map((ticket, index) => (
              <TicketCardWithStableCallbacks
                key={ticket.id}
                ticket={ticket}
                index={index}
                isInitialLoad={isInitialLoad}
                onEditTicket={onEditTicket}
                onDeleteTicket={onDeleteTicket}
                onClickTicket={handleTicketClick}
                onUpdateSubTasks={onUpdateSubTasks}
              />
            ))}
            {column.id !== "complete" && (
              <AddTicketButton onAddTicket={onAddTicket} />
            )}
          </div>
        </SortableContext>

        <div className="h-4 w-full bg-gradient-to-b from-transparent to-background fixed bottom-0 left-0" />
      </CardContent>
    </Card>
  );
}

function TicketCardWithStableCallbacks({
  ticket,
  index,
  isInitialLoad,
  onEditTicket,
  onDeleteTicket,
  onClickTicket,
  onUpdateSubTasks,
}: {
  ticket: Ticket;
  index: number;
  isInitialLoad: boolean;
  onEditTicket: (t: Ticket) => void;
  onDeleteTicket: (id: string) => void;
  onClickTicket: (t: Ticket) => void;
  onUpdateSubTasks: (ticketId: string, subTasks: SubTask[]) => void;
}) {
  const handleEdit = useCallback(
    () => onEditTicket(ticket),
    [onEditTicket, ticket]
  );
  const handleDelete = useCallback(
    () => onDeleteTicket(ticket.id),
    [onDeleteTicket, ticket.id]
  );
  const handleClick = useCallback(
    () => onClickTicket(ticket),
    [onClickTicket, ticket]
  );
  const handleSubTasksChange = useCallback(
    (subTasks: SubTask[]) => onUpdateSubTasks(ticket.id, subTasks),
    [onUpdateSubTasks, ticket.id]
  );

  return (
    <TicketCard
      ticket={ticket}
      index={index}
      isInitialLoad={isInitialLoad}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onClick={handleClick}
      onSubTasksChange={handleSubTasksChange}
    />
  );
}
