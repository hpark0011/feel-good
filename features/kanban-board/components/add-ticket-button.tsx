"use client";

import { PlusIcon } from "lucide-react";

interface AddTicketButtonProps {
  onAddTicket: () => void;
}

export function AddTicketButton({ onAddTicket }: AddTicketButtonProps) {
  return (
    <button
      type="button"
      onClick={onAddTicket}
      className="flex w-full items-center flex-col justify-center bg-transparent border border-transparent p-2 rounded-xl h-[48px] hover:bg-card transition-all duration-200 ease-out hover:scale-102 shadow-none scale-100 active:scale-98 cursor-pointer relative group hover:border-card-border inset-shadow-none hover:shadow-[0_12px_12px_-6px_rgba(255,255,255,0.9),_0_14px_14px_-6px_rgba(0,0,0,0.3)] dark:hover:shadow-[0_12px_12px_-6px_rgba(255,255,255,0.15),_0_14px_14px_-6px_rgba(0,0,0,0.9)] "
    >
      <div className="flex items-center gap-1 drop-shadow-none group-hover:drop-shadow-[2px_2px_0px_rgba(0,0,0,0.1)] transition-all duration-200 ease-out group-hover:scale-105 scale-100">
        <PlusIcon className="size-4 text-icon-light group-hover:text-text-primary" />
        <span className="text-sm text-text-muted group-hover:text-text-primary">
          Add Ticket
        </span>
      </div>
    </button>
  );
}
