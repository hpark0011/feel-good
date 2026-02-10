"use client";

import { ViewTransition } from "react";
import type { Profile } from "@/features/profile";
import { MobileProfileLayout, ProfileInfoView } from "@/features/profile";
import { ScrollRootProvider } from "@/features/articles";
import { useIsMobile } from "@feel-good/ui/hooks/use-mobile";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@feel-good/ui/primitives/resizable";
import { DashboardHeader } from "./dashboard-header";

type DashboardShellProps = {
  profile: Profile;
  children: React.ReactNode;
};

export function DashboardShell({ profile, children }: DashboardShellProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <main className="h-screen">
        <DashboardHeader className="fixed top-0 inset-x-0" />
        <MobileProfileLayout
          profile={<ProfileInfoView profile={profile} />}
          content={(scrollRoot) => (
            <ScrollRootProvider value={scrollRoot}>
              <div className="px-3">
                <ViewTransition name="dashboard-content">
                  {children}
                </ViewTransition>
              </div>
            </ScrollRootProvider>
          )}
        />
      </main>
    );
  }

  return (
    <main className="h-screen">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={50} minSize={20} maxSize={50}>
          <div className="relative z-20 h-full flex flex-col justify-center items-center px-6">
            <ProfileInfoView profile={profile} />
          </div>
        </ResizablePanel>

        <ResizableHandle
          className="bg-border-subtle data-[resize-handle-state=hover]:shadow-[0_0_0_1px_var(--color-resizable-handle-hover)] data-[resize-handle-state=drag]:shadow-[0_0_0_1px_var(--color-resizable-handle-hover)]"
        />

        <ResizablePanel defaultSize={50}>
          <div className="relative h-full min-w-0 overflow-y-auto pb-[64px]">
            <DashboardHeader className="sticky top-0" />
            <div className="px-4">
              <ViewTransition name="dashboard-content">
                {children}
              </ViewTransition>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}
