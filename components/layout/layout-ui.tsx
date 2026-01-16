import { cn } from "@/lib/utils";

export const BodyContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        // Mobile: vertical stack with scroll
        "flex flex-col overflow-y-auto min-h-screen pt-20 px-4 gap-0",
        // Desktop: horizontal layout (existing behavior)
        "md:flex-row md:overflow-x-auto md:p-0 md:pt-20",
        className
      )}
    >
      {children}
    </div>
  );
};
