"use client";

import { useMemo, useState, ViewTransition } from "react";
import type { Profile } from "@/features/profile";
import {
  MobileProfileLayout,
  ProfileInfoView,
  ProfileProvider,
} from "@/features/profile";
import { ScrollRootProvider } from "@/features/articles";
import { useIsMobile } from "@feel-good/ui/hooks/use-mobile";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@feel-good/ui/primitives/resizable";
import { WorkspaceNavbar } from "@/components/workspace-navbar";
import { ToolbarSlotProvider, ToolbarSlotTarget } from "@/components/workspace-toolbar-slot";
import { useNavDirection } from "@/hooks/use-nav-direction";

type ProfileShellProps = {
  profile: Profile;
  isOwner: boolean;
  children: React.ReactNode;
};

export function ProfileShell(
  { profile, isOwner, children }: ProfileShellProps,
) {
  const isMobile = useIsMobile();
  useNavDirection(); // side effect only — sets data-navDirection for ViewTransition CSS

  const [mobileScrollRoot, setMobileScrollRoot] = useState<
    HTMLDivElement | null
  >(null);

  const contextValue = useMemo(
    () => ({ isOwner }),
    [isOwner],
  );

  return (
    <ProfileProvider value={contextValue}>
      {isMobile
        ? (
          <main className="h-screen">
            <ToolbarSlotProvider>
              <WorkspaceNavbar className="fixed top-0 inset-x-0" />
              <MobileProfileLayout
                profile={<ProfileInfoView profile={profile} />}
                content={() => (
                  <>
                    <ToolbarSlotTarget />
                    <ViewTransition name="profile-content">
                      <div
                        ref={setMobileScrollRoot}
                        className="overflow-y-auto overscroll-y-contain h-full px-3"
                      >
                        <ScrollRootProvider value={mobileScrollRoot}>
                          {children}
                        </ScrollRootProvider>
                      </div>
                    </ViewTransition>
                  </>
                )}
              />
            </ToolbarSlotProvider>
          </main>
        )
        : (
          <main className="h-screen">
            <ResizablePanelGroup direction="horizontal" className="h-full">
              <ResizablePanel defaultSize={50} minSize={25} maxSize={80}>
                <div className="relative z-20 h-full flex flex-col justify-center items-center px-6">
                  <ProfileInfoView profile={profile} />
                </div>
              </ResizablePanel>

              <ResizableHandle className="bg-border-subtle data-[resize-handle-state=hover]:shadow-[0_0_0_1px_var(--color-resizable-handle-hover)] data-[resize-handle-state=drag]:shadow-[0_0_0_1px_var(--color-resizable-handle-hover)] z-20 relative" />

              <ResizablePanel defaultSize={50} minSize={40} maxSize={80}>
                <ToolbarSlotProvider>
                  <div className="relative h-full min-w-0 flex flex-col">
                    <WorkspaceNavbar />
                    <ToolbarSlotTarget />
                    <div className="flex-1 min-h-0">
                      <ViewTransition name="profile-content">
                        <div className="overflow-y-auto h-full px-4 pb-[64px]">
                          {children}
                        </div>
                      </ViewTransition>
                    </div>
                  </div>
                </ToolbarSlotProvider>
              </ResizablePanel>
            </ResizablePanelGroup>
          </main>
        )}
    </ProfileProvider>
  );
}
