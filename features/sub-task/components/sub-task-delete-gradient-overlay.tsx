import { cn } from "@/lib/utils";

/**
 * Gradient fade overlay for sub-task delete button.
 * Provides visual fade effect that reveals on hover within parent group/sub-task.
 */
export function SubTaskDeleteGradientOverlay() {
  return (
    <span
      aria-hidden='true'
      className={cn(
        // Positioning
        "absolute inset-y-0 right-0 z-10",
        // Sizing
        "w-4",
        // Background - gradient fade
        "bg-gradient-to-l from-dialog via-dialog/90 to-transparent",
        // Interactive states - hover background
        "group-hover/sub-task:from-hover group-hover/sub-task:via-hover group-hover/sub-task:to-transparent",
        // Behavior
        "pointer-events-none"
      )}
    />
  );
}
