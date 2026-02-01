"use client";

import { ThemeProvider } from "@feel-good/ui/providers/theme-provider";
import { SidebarProvider } from "@feel-good/ui/primitives/sidebar";

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
    >
      <SidebarProvider>{children}</SidebarProvider>
    </ThemeProvider>
  );
}
