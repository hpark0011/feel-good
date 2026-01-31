import { cn } from "@feel-good/ui/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

export function Section({ children, className }: SectionProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-7 py-1.5 pb-10",
        className,
      )}
    >
      {children}
    </div>
  );
}
