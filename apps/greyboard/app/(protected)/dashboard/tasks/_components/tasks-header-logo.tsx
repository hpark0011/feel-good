"use client";

import {
  HeaderLogo,
} from "@/components/header/header-ui";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";

interface TasksHeaderLogoProps {
  onThemeToggle: () => void;
}

export function TasksHeaderLogo({
  onThemeToggle,
}: TasksHeaderLogoProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList className='items-center text-[14px] text-foreground sm:gap-0'>
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <BreadcrumbLink asChild>
                <button
                  type='button'
                  aria-label='Open navigation menu'
                  className='bg-background/5 backdrop-blur-lg p-0 m-0 border-none outline-none focus-visible:ring-2 focus-visible:ring-border-highlight rounded-full'
                >
                  <HeaderLogo />
                </button>
              </BreadcrumbLink>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align='start'
              sideOffset={6}
              className='min-w-[160px] p-1'
            >
              <DropdownMenuItem onSelect={onThemeToggle}>
                <Icon
                  name='CircleLeftHalfFilledRightHalfStripedHorizontalIcon'
                  className='text-icon-light'
                />
                Toggle theme
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
