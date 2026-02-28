import { Outlet } from "react-router-dom";
import { ErrorBoundary } from "@/src/components/error-boundary";
import { MainHeader } from "@/src/features/header/main-header";

export function App() {
  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <MainHeader />
      <main className="flex-1 overflow-auto">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  );
}
