"use client";

import { useState, useMemo } from "react";
import { DropdownMenuSeparator } from "@feel-good/ui/primitives/dropdown-menu";
import { getUniqueCategories } from "../../utils/article-filter";
import type { Article } from "../../lib/mock-articles";
import { CategoryFilterSearch } from "./category-filter-search";
import { CategoryFilterBadges } from "./category-filter-badges";
import { CategoryFilterList } from "./category-filter-list";

type CategoryFilterContentProps = {
  articles: Article[];
  selectedCategories: string[];
  onToggleCategory: (name: string) => void;
  onClearFilter: () => void;
};

export function CategoryFilterContent({
  articles,
  selectedCategories,
  onToggleCategory,
  onClearFilter,
}: CategoryFilterContentProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const allCategories = useMemo(
    () => getUniqueCategories(articles),
    [articles]
  );

  const filteredCategories = allCategories.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <CategoryFilterSearch value={searchQuery} onChange={setSearchQuery} />
      <DropdownMenuSeparator />
      <CategoryFilterBadges
        selectedCategories={selectedCategories}
        onRemove={onToggleCategory}
        onClearFilter={onClearFilter}
      />
      {selectedCategories.length > 0 && <DropdownMenuSeparator />}
      <CategoryFilterList
        categories={filteredCategories}
        selectedCategories={selectedCategories}
        onToggle={onToggleCategory}
      />
    </>
  );
}
