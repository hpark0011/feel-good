import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";
import { DashboardShell } from "./_components/dashboard-shell";
import { MOCK_PROFILE } from "@/features/profile";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthenticated();
  if (!authed) {
    redirect("/sign-in");
  }
  return <DashboardShell profile={MOCK_PROFILE}>{children}</DashboardShell>;
}
