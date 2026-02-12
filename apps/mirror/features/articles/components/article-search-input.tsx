"use client";

import { useEffect, useRef } from "react";
import { Button } from "@feel-good/ui/primitives/button";
import { Icon } from "@feel-good/ui/components/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@feel-good/ui/primitives/tooltip";
import { cn } from "@feel-good/utils/cn";

type ArticleSearchInputProps = {
  query: string;
  onQueryChange: (q: string) => void;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export function ArticleSearchInput({
  query,
  onQueryChange,
  isOpen,
  onOpen,
  onClose,
}: ArticleSearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hasBeenOpen = useRef(false);

  // Manage focus: into input when opening, back to button when closing.
  // The ref guard prevents stealing focus on initial mount.
  useEffect(() => {
    if (isOpen) {
      hasBeenOpen.current = true;
      inputRef.current?.focus();
    } else if (hasBeenOpen.current) {
      buttonRef.current?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    }
  };

  return (
    <div className="flex items-center">
      {/* Search toggle button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={buttonRef}
            variant="ghost"
            size="icon-sm"
            onClick={isOpen ? onClose : onOpen}
            aria-label="Search articles"
            aria-expanded={isOpen}
          >
            <Icon name="MagnifyingGlassIcon" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Search</TooltipContent>
      </Tooltip>

      {/* Expandable input wrapper */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-out",
          isOpen ? "w-[160px] opacity-100" : "w-0 opacity-0",
        )}
      >
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          aria-label="Search articles"
          tabIndex={isOpen ? 0 : -1}
          className="h-7 w-full min-w-0 rounded-md bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
        />
      </div>

      {/* Clear button — only when input has text */}
      {isOpen && query.length > 0 && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onQueryChange("")}
          aria-label="Clear search"
        >
          <Icon name="XmarkCircleFillIcon" />
        </Button>
      )}
    </div>
  );
}
