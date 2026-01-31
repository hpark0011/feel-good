import { cn } from "@feel-good/ui/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

export function Section({ children, className }: SectionProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border p-4 pt-3 rounded-2xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
