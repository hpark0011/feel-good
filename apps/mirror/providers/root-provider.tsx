/**
 * Root provider should be placed in the root layout.
 */

"use client";

import { ConvexProvider, ConvexReactClient } from "@feel-good/convex";
import { ThemeProvider } from "@feel-good/ui/providers/theme-provider";
import { SessionProvider } from "@/lib/auth-client";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ConvexProvider client={convex}>
        <SessionProvider>{children}</SessionProvider>
      </ConvexProvider>
    </ThemeProvider>
  );
}
