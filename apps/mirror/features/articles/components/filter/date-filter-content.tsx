"use client";

import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@feel-good/ui/primitives/dropdown-menu";
import type { DatePreset } from "../../utils/date-preset";

type DateFilterContentProps = {
  value: DatePreset | null;
  onChange: (preset: DatePreset | null) => void;
};

export function DateFilterContent({
  value,
  onChange,
}: DateFilterContentProps) {
  return (
    <DropdownMenuRadioGroup
      value={value ?? "any_time"}
      onValueChange={(val) =>
        onChange(val === "any_time" ? null : (val as DatePreset))
      }
    >
      <DropdownMenuRadioItem value="any_time">
        Any time
      </DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="today">Today</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="this_week">
        This week
      </DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="this_month">
        This month
      </DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="this_year">
        This year
      </DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  );
}
