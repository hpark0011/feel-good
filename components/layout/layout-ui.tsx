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
      className={cn("flex p-0 overflow-x-auto min-h-screen pt-20", className)}
    >
      {children}
    </div>
  );
};
