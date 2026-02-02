import { cn } from "@feel-good/ui/lib/utils";

interface PageSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageSection(
  { children, className }: PageSectionProps,
) {
  return (
    <div
      className={cn(
        "flex flex-col gap-10 py-1.5 pb-12",
        className,
      )}
    >
      {children}
    </div>
  );
}
