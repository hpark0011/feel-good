import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-server";
import { DashboardHeader } from "@/app/(protected)/dashboard/_components/dashboard-header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthenticated();

  if (!authed) {
    redirect("/sign-in");
  }

  return (
    <>
      <DashboardHeader />
      {children}
    </>
  );
}
