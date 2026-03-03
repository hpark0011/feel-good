"use client";

import type { ReactNode } from "react";
import { useSelectedLayoutSegment } from "next/navigation";
import { useIsMobile } from "@feel-good/ui/hooks/use-mobile";
import { InteractionPaneAnimator } from "./interaction-pane-animator";
import { DesktopWorkspace } from "./desktop-workspace";
import { MobileWorkspace } from "./mobile-workspace";
import { ContentPanel } from "./content-panel";

type WorkspaceShellProps = {
  interaction: ReactNode;
  children: ReactNode;
};

export function WorkspaceShell({ interaction, children }: WorkspaceShellProps) {
  const isMobile = useIsMobile();
  const segment = useSelectedLayoutSegment();
  const isChatView = segment === "chat";

  if (isMobile) {
    return (
      <MobileWorkspace isChatView={isChatView} interaction={interaction}>
        {children}
      </MobileWorkspace>
    );
  }

  return (
    <DesktopWorkspace
      interaction={
        <InteractionPaneAnimator>{interaction}</InteractionPaneAnimator>
      }
    >
      {isChatView ? children : <ContentPanel>{children}</ContentPanel>}
    </DesktopWorkspace>
  );
}
