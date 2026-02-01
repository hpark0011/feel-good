import { AppSidebar } from "@/components/app-sidebar";
import { NavHeader } from "@/components/nav-header";
import { SidebarInset } from "@feel-good/ui/primitives/sidebar";

export function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <NavHeader />
        <main>{children}</main>
      </SidebarInset>
    </>
  );
}
