import { cn } from "@feel-good/ui/lib/utils";

interface ComponentsSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function ComponentsSection(
  { children, className }: ComponentsSectionProps,
) {
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
