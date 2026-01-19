"use client";

import type { MouseEvent } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CardHeader } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Icon } from "@/components/ui/icon";
import { ColumnTitle } from "@/features/task-board-core";
import type { Column } from "@/types/board.types";

interface ListSectionHeaderProps {
  column: Column;
  ticketCount: number;
  onClearColumn?: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

/**
 * Clickable header for list sections with collapse/expand functionality.
 * Shows column info and chevron indicator.
 */
export function ListSectionHeader({
  column,
  ticketCount,
  onClearColumn,
  isExpanded,
  onToggleExpand,
}: ListSectionHeaderProps) {
  const isCompleteColumn = column.id === "complete";
  const showClearButton = isCompleteColumn && onClearColumn && ticketCount > 0;

  const handleClearColumnClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onClearColumn?.();
  };

  return (
    <CardHeader
      className={cn(
        "pl-4.5 pb-2 gap-0 pr-4",
        "cursor-pointer active:bg-neutral-100 dark:active:bg-neutral-800 py-3"
      )}
      onClick={onToggleExpand}
      role="button"
      aria-expanded={isExpanded}
      aria-label={`Toggle ${column.title} tickets`}
    >
      <div className="flex items-center justify-between h-6">
        <ColumnTitle
          icon={column.icon}
          iconSize={column.iconSize}
          iconColor={column.iconColor}
          title={column.title}
          count={ticketCount}
        />
        <div className="flex items-center gap-1">
          {showClearButton && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="icon"
                  onClick={handleClearColumnClick}
                  className="cursor-pointer active:scale-90 transition-all duration-200 ease-out size-6.5"
                >
                  <Icon
                    name="XmarkIcon"
                    className="size-4.5 text-icon-light"
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Clear All Completed Tickets</TooltipContent>
            </Tooltip>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              isExpanded && "rotate-180"
            )}
          />
        </div>
      </div>
    </CardHeader>
  );
}
