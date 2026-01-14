"use client";

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface TicketActionToolbarProps {
  isDragging: boolean;
  isSubTaskEditorOpen: boolean;
  onToggleSubTasks: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * Action toolbar with edit, delete, and sub-tasks toggle buttons
 * Appears on hover in the top-right corner of the card
 */
export function TicketActionToolbar({
  isDragging,
  isSubTaskEditorOpen,
  onToggleSubTasks,
  onEdit,
  onDelete,
}: TicketActionToolbarProps) {
  if (isDragging) return null;

  return (
    <div className='absolute top-[5px] right-[5px] flex opacity-0 group-hover:opacity-100 flex-row items-center transition-opacity pointer-events-none group-hover:pointer-events-auto border rounded-md border-border-light bg-white dark:bg-neutral-800'>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size='sm'
            variant='ghost'
            className='h-[22px] w-7 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-none cursor-pointer hover:shadow-lg rounded-l-[7px] flex items-center justify-center has-[svg]:pl-0 has-[svg]:pr-0'
            onClick={(e) => {
              e.stopPropagation();
              onToggleSubTasks();
            }}
          >
            <Icon
              name='ChecklistIcon'
              className={cn(
                "size-4.5",
                isSubTaskEditorOpen ? "text-blue-500" : "text-icon-dark"
              )}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {isSubTaskEditorOpen ? "Hide sub-tasks" : "Manage sub-tasks"}
        </TooltipContent>
      </Tooltip>

      <div className='self-stretch w-px bg-border-light' />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size='sm'
            variant='ghost'
            className='h-[22px] w-7 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-none cursor-pointer hover:shadow-lg flex items-center justify-center has-[svg]:pl-0 has-[svg]:pr-0'
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
          >
            <Icon name='PencilIcon' className='size-4.5 text-icon-dark' />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Edit Ticket</TooltipContent>
      </Tooltip>

      <div className='self-stretch w-px bg-border-light' />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size='sm'
            variant='ghost'
            className='h-[22px] w-7 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-none cursor-pointer hover:shadow-lg rounded-r-[7px] has-[svg]:pl-0 has-[svg]:pr-0'
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
          >
            <Icon name='TrashIcon' className='size-4 text-icon-dark' />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Delete Ticket</TooltipContent>
      </Tooltip>
    </div>
  );
}
