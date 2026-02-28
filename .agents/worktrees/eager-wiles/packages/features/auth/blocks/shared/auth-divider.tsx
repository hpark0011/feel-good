import { type ReactNode } from "react";

interface AuthDividerProps {
  children?: ReactNode;
}

export function AuthDivider({ children = "or" }: AuthDividerProps) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="bg-border h-px flex-1" />
      <span className="text-muted-foreground text-sm">{children}</span>
      <div className="bg-border h-px flex-1" />
    </div>
  );
}
