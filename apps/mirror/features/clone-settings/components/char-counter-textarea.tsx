"use client";

import * as React from "react";
import { Textarea } from "@feel-good/ui/primitives/textarea";
import { cn } from "@feel-good/utils/cn";

type CharCounterTextareaProps = Omit<
  React.ComponentProps<"textarea">,
  "value" | "onChange"
> & {
  value: string | null;
  onChange: (value: string | null) => void;
  maxLength: number;
  label?: string;
};

export function CharCounterTextarea({
  value,
  onChange,
  maxLength,
  label,
  className,
  ...props
}: CharCounterTextareaProps) {
  const currentLength = value?.length ?? 0;
  const warningThreshold = Math.floor(maxLength * 0.8);

  const counterState: "warning" | "danger" | "normal" =
    currentLength >= maxLength
      ? "danger"
      : currentLength >= warningThreshold
        ? "warning"
        : "normal";

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <span className="text-sm font-medium text-foreground">{label}</span>
      )}
      <Textarea
        value={value ?? ""}
        onChange={(e) => {
          const newValue = e.target.value;
          onChange(newValue === "" ? null : newValue);
        }}
        maxLength={maxLength}
        className={cn(className)}
        {...props}
      />
      <span
        data-state={counterState}
        className={cn(
          "text-xs text-right tabular-nums",
          counterState === "normal" && "text-muted-foreground",
          counterState === "warning" && "text-amber-500",
          counterState === "danger" && "text-destructive",
        )}
      >
        {currentLength}/{maxLength}
      </span>
    </div>
  );
}
