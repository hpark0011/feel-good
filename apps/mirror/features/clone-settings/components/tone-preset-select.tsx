"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@feel-good/ui/primitives/select";
import { TONE_PRESETS, type TonePreset } from "@feel-good/convex/chat/tonePresets";

type TonePresetSelectProps = {
  value: TonePreset | null;
  onChange: (value: TonePreset | null) => void;
};

const NONE_VALUE = "__none__";

export function TonePresetSelect({ value, onChange }: TonePresetSelectProps) {
  return (
    <Select
      value={value ?? NONE_VALUE}
      onValueChange={(v) => {
        onChange(v === NONE_VALUE ? null : (v as TonePreset));
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select a tone preset..." />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE_VALUE}>No preset (default)</SelectItem>
        {(Object.entries(TONE_PRESETS) as [TonePreset, { label: string; clause: string }][]).map(
          ([key, { label }]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ),
        )}
      </SelectContent>
    </Select>
  );
}
