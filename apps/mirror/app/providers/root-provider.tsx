/**
 * Root provider should be placed in the root layout.
 */

"use client";

import { ThemeProvider } from "@feel-good/ui/providers/theme-provider";

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
