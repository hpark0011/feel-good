"use client";

import { cn } from "@/lib/utils";
import { getProjectColorBgClass } from "@/config/tasks.config";
import type { Project } from "@/types/board.types";

interface ProjectTagProps {
  project: Project | undefined;
  isDragging: boolean;
}

/**
 * Displays a project tag above the ticket card with color indicator
 */
export function ProjectTag({ project, isDragging }: ProjectTagProps) {
  if (!project) return null;

  return (
    <div className='relative ml-[12px] w-fit cursor-grab active:cursor-grabbing'>
      <div className='flex items-center gap-[3px] bg-neutral-100 dark:bg-neutral-900 w-fit px-2 pl-2 py-[1px] rounded-t-md after:content-[""] after:absolute after:bottom-[-12px] after:left-0 after:w-full after:h-[12px] after:bg-neutral-100 dark:after:bg-neutral-900 relative border-card-border dark:border-neutral-900 border hover:bg-hover'>
        <div className='flex items-center justify-center'>
          <div
            className={cn(
              "size-[5px] mr-[1px] rounded-full",
              getProjectColorBgClass(project.color)
            )}
          />
        </div>
        <span className='text-xs text-text-tertiary'>{project.name}</span>
      </div>
      <div className='absolute bottom-[-3px] left-[-6px] bg-neutral-100 dark:bg-neutral-900'>
        <div
          className={cn(
            "w-[7px] h-[8px] bg-background rounded-br-full border-r border-b border-white dark:border-neutral-900",
            isDragging && "hidden"
          )}
        />
      </div>
      <div className='absolute bottom-[-1px] right-[-7px] bg-neutral-100 dark:bg-neutral-900'>
        <div
          className={cn(
            "w-[8px] h-[8px] bg-background rounded-bl-[6px] border-l border-b border-white dark:border-neutral-900",
            isDragging && "hidden"
          )}
        />
      </div>
    </div>
  );
}
