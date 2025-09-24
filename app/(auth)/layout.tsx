import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">G</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Greyboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome to your collaborative workspace
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}