import { DashboardHeader } from "./_components/dashboard-header";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DashboardHeader />
      {children}
    </>
  );
}
