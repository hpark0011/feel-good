"use client";

import { DropdownMenuCheckboxItem } from "@feel-good/ui/primitives/dropdown-menu";

interface CategoryFilterListProps {
  categories: { name: string; count: number }[];
  selectedCategories: string[];
  onToggle: (name: string) => void;
}

export function CategoryFilterList({
  categories,
  selectedCategories,
  onToggle,
}: CategoryFilterListProps) {
  if (categories.length === 0) {
    return (
      <p className="px-2 py-4 text-center text-sm text-muted-foreground">
        No categories found
      </p>
    );
  }

  return (
    <div className="max-h-[200px] overflow-y-auto">
      {categories.map((category) => (
        <DropdownMenuCheckboxItem
          key={category.name}
          checked={selectedCategories.includes(category.name)}
          onCheckedChange={() => onToggle(category.name)}
          onSelect={(e) => e.preventDefault()}
        >
          <span className="flex-1">{category.name}</span>
          <span className="text-muted-foreground text-xs">
            {category.count}
          </span>
        </DropdownMenuCheckboxItem>
      ))}
    </div>
  );
}
