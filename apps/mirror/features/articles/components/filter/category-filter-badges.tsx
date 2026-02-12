"use client";

import { Icon } from "@feel-good/ui/components/icon";

type CategoryFilterBadgesProps = {
  selectedCategories: string[];
  onRemove: (name: string) => void;
};

export function CategoryFilterBadges({
  selectedCategories,
  onRemove,
}: CategoryFilterBadgesProps) {
  if (selectedCategories.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 px-2 py-1.5">
      {selectedCategories.map((category) => (
        <div
          key={category}
          className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-xs"
        >
          {category}
          <button
            onClick={() => onRemove(category)}
            className="flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label={`Remove ${category} filter`}
          >
            <Icon name="XmarkCircleFillIcon" className="size-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
