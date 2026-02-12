"use client";

import { useEffect, useRef } from "react";
import { Button } from "@feel-good/ui/primitives/button";
import { Icon } from "@feel-good/ui/components/icon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@feel-good/ui/primitives/tooltip";

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

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      // Small delay to let the transition start before focusing
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Return focus to search button when closed
  useEffect(() => {
    if (!isOpen) {
      buttonRef.current?.focus();
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
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
        className={`overflow-hidden transition-all duration-200 ease-out ${
          isOpen ? "w-[160px] opacity-100" : "w-0 opacity-0"
        }`}
      >
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search..."
          aria-label="Search articles"
          role="searchbox"
          className="h-7 w-full min-w-0 rounded-md bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Clear button — only when input has text */}
      {isOpen && query.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onQueryChange("")}
              aria-label="Clear search"
            >
              <Icon name="XmarkCircleFillIcon" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear search</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
