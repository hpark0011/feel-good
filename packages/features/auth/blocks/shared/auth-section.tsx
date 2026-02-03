import type { ReactNode } from "react";

interface AuthSectionProps {
  children: ReactNode;
}

export function AuthSection({ children }: AuthSectionProps) {
  return <div className="space-y-4">{children}</div>;
}
