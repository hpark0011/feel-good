"use client";

import { useSession } from "@/lib/auth-client";
import { DashboardView } from "./_view/dashboard-view";

export default function DashboardPage() {
  const { isLoading } = useSession();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-8">
        <DashboardView />
      </main>
    </div>
  );
}
