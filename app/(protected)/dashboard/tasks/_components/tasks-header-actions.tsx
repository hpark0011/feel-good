"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ChangeEvent } from "react";
import { ProjectFilter } from "./project-filter";

interface TasksHeaderActionsProps {
  onImport: (event: ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onClear: () => void;
  onInsightsClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

export function TasksHeaderActions({
  onImport,
  onExport,
  onClear,
  onInsightsClick,
  fileInputRef,
}: TasksHeaderActionsProps) {
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='icon'
            className='h-6 w-6 cursor-pointer rounded-[6px] gap-0.5'
            aria-label='Insights'
            onClick={onInsightsClick}
          >
            <Icon
              name='WaveformPathEcgIcon'
              className='size-5.5 text-icon-light'
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Total focus time</TooltipContent>
      </Tooltip>

      <ProjectFilter />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='icon'
            className='h-6 w-6 cursor-pointer rounded-[6px]'
            aria-label='Board actions'
          >
            <Icon name='EllipsisIcon' className='size-4.5 text-icon-light' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end' className='w-[180px]'>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              fileInputRef.current?.click();
            }}
          >
            <Icon
              name='ArrowUpToLineCompactIcon'
              className='size-4.5 text-icon-light'
            />
            Import tasks
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              onExport();
            }}
          >
            <Icon
              name='ArrowDownToLineCompactIcon'
              className='size-4.5 text-icon-light'
            />
            Export tasks
          </DropdownMenuItem>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem
                onSelect={(event) => event.preventDefault()}
                variant='destructive'
              >
                <Icon
                  name='XmarkCircleFillIcon'
                  className='size-4.5 text-destructive'
                />
                Clear all board
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Clear Board</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete all tickets and reset the board
                  to empty state. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onClear}>
                  Clear Board
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>

      <input
        ref={fileInputRef}
        type='file'
        accept='.json'
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          onImport(e);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }}
        style={{ display: "none" }}
      />
    </>
  );
}
