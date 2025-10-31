import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type GradientFadeProps = {
  position?: "top" | "bottom";
  height?: number | string;
} & HTMLAttributes<HTMLDivElement>;

export function GradientFade({
  position = "bottom",
  height = 16,
  className,
  style,
  ...props
}: GradientFadeProps) {
  const offsetClass = position === "top" ? "top-[-1px]" : "bottom-[-1px]";
  const directionClass =
    position === "top" ? "bg-gradient-to-b" : "bg-gradient-to-t";
  const heightValue =
    height === undefined
      ? undefined
      : typeof height === "number"
        ? `${height}px`
        : height;

  return (
    <div
      {...props}
      className={cn(
        "pointer-events-none absolute inset-x-0 left-0 from-background to-transparent",
        offsetClass,
        directionClass,
        className
      )}
      style={{
        height: heightValue,
        ...style,
      }}
    />
  );
}

export default GradientFade;
