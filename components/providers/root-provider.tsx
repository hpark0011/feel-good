"use client";

// all the providers go here
import { ThemeProvider } from "@/components/providers/theme-provider";
import dynamic from "next/dynamic";

import { ReactQueryProvider } from "./react-query-provider";
import { Toaster } from "sonner";
import { useThemeToggle } from "@/hooks/use-theme-toggle";
import { NavigationProvider } from "../navigation/navigation-context";
import { useAuthPersistence } from "@/hooks/use-auth-persistence";

// ThemeWrapper is used to toggle the theme when the user presses the command + k key. This is only for development purposes.
function ThemeWrapper({ children }: { children: React.ReactNode }) {
  useThemeToggle();
  // Initialize auth persistence for Electron
  useAuthPersistence();
  return children;
}

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReactQueryProvider>
      <NavigationProvider>
        <ThemeProvider
          attribute='class'
          defaultTheme='light'
          enableSystem
          disableTransitionOnChange
          storageKey='theme'
          // themes={['light', 'dark']}
        >
          <ThemeWrapper>
            {children}
            {process.env.NEXT_PUBLIC_ELECTRON_BUILD !== "true" && <Analytics />}
            <Toaster />
          </ThemeWrapper>
        </ThemeProvider>
      </NavigationProvider>
    </ReactQueryProvider>
  );
}
