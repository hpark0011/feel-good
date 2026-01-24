"use client";

import {
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COLUMNS } from "@/config/board.config";
import { cn } from "@/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import type { ColumnId } from "@/types/board.types";
import type { ComponentType, SVGProps } from "react";

interface StatusSelectProps {
  value: ColumnId;
  onValueChange: (value: ColumnId) => void;
  className?: string;
}

const COLUMN_OPTIONS = COLUMNS.map((column) => ({
  value: column.id,
  label: column.title,
  Icon: column.icon as ComponentType<SVGProps<SVGSVGElement>>,
  iconColor: column.iconColor,
  iconSize: column.iconSize,
}));

export function StatusSelect({
  value,
  onValueChange,
  className,
}: StatusSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn("pl-1 border-none gap-0 text-[13px] ", className)}
      >
        <SelectValue placeholder='Select a status' />
        <SelectIcon asChild>
          <ChevronDownIcon className='size-4 text-icon-light' />
        </SelectIcon>
      </SelectTrigger>
      <SelectContent>
        {COLUMN_OPTIONS.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className='pl-1.5'
          >
            <div className='flex items-center gap-1 px-1 pl-0'>
              <option.Icon
                className={cn(option.iconColor, "min-h-5 min-w-5")}
              />
              <span>{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
