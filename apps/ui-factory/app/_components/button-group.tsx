import { cn } from "@feel-good/ui/lib/utils";

interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function ButtonGroup({ children, className }: ButtonGroupProps) {
  return (
    <div className={cn("flex gap-2 w-[calc(100%-0.5rem)] -ml-1", className)}>
      {children}
    </div>
  );
}
