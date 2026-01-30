import { cn } from "@feel-good/ui/lib/utils";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

export function Section({ children, className }: SectionProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {children}
    </div>
  );
}
