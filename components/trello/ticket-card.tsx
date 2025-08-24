"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Edit, Trash } from "lucide-react";
import { Ticket } from "../../types/board";
import { Separator } from "@/components/ui/separator";

interface TicketCardProps {
  ticket: Ticket;
  isDragging?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TicketCard({
  ticket,
  isDragging = false,
  onEdit,
  onDelete,
}: TicketCardProps) {
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

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative border border-white/90 hover:shadow-xl transition-all duration-200 translate-y-0 hover:translate-y-[-1px] scale-100 hover:scale-[1.02] ease-out group cursor-grab active:cursor-grabbing p-0 gap-0 bg-background hover:bg-base hover:border-white/100 inset-shadow-none shadow-[0_12px_12px_-6px_rgba(255,255,255,0.9),_0_14px_14px_-6px_rgba(0,0,0,0.3)]",
        isDragging &&
          "rotate-5 scale-105 shadow-[0_12px_12px_-6px_rgba(255,255,255,0.9),_0_14px_14px_-6px_rgba(0,0,0,0.3)]"
      )}
      {...attributes}
      {...listeners}
    >
      <CardHeader className={cn("p-4 pb-4 flex", ticket.description && "pb-2")}>
        <div className='flex items-start gap-2'>
          <div className='flex-1 min-w-0'>
            <CardTitle className='text-md font-medium leading-none'>
              {ticket.title}
            </CardTitle>
          </div>
          {!isDragging && (
            <div className='absolute top-2 right-2 flex opacity-0 group-hover:opacity-100 flex-row items-center transition-opacity pointer-events-none group-hover:pointer-events-auto border rounded-md border-neutral-100 bg-base shadow-lg'>
              <Button
                size='icon'
                variant='ghost'
                className='h-6 w-7 bg-transparent hover:bg-neutral-100 rounded-none cursor-pointer hover:shadow-lg rounded-l-md'
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit?.();
                }}
              >
                <Icon
                  name='SquareAndPencilIcon'
                  className='h-3 w-3 text-icon-dark'
                />
              </Button>
              <div className='self-stretch w-px bg-neutral-100' />
              <Button
                size='icon'
                variant='ghost'
                className='h-6 w-7 bg-transparent hover:bg-neutral-100 rounded-none cursor-pointer hover:shadow-lg rounded-r-md'
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.();
                }}
              >
                <Icon name='TrashIcon' className='h-3 w-3 text-icon-dark' />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      {ticket.description && (
        <CardContent className='p-4 pt-0'>
          <p className='text-sm line-clamp-2 w-full leading-[140%] text-text-tertiary'>
            {ticket.description}
          </p>
        </CardContent>
      )}
    </Card>
  );
}
