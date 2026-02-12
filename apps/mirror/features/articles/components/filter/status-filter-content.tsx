"use client";

import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@feel-good/ui/primitives/dropdown-menu";

type StatusFilterContentProps = {
  value: "draft" | "published" | null;
  onChange: (status: "draft" | "published" | null) => void;
};

export function StatusFilterContent({
  value,
  onChange,
}: StatusFilterContentProps) {
  return (
    <DropdownMenuRadioGroup
      value={value ?? "all"}
      onValueChange={(val) =>
        onChange(val === "all" ? null : (val as "draft" | "published"))
      }
    >
      <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="draft">Draft</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="published">Published</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  );
}
