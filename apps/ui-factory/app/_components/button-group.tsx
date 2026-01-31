import { cn } from "@feel-good/ui/lib/utils";

interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function ButtonGroup({ children, className }: ButtonGroupProps) {
  return (
    <div className={cn("flex gap-3 w-full", className)}>
      {children}
    </div>
  );
}
