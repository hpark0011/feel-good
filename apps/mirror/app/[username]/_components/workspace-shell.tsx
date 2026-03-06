"use client";

import type { ReactNode } from "react";
import { useSelectedLayoutSegment } from "next/navigation";
import { useIsMobile } from "@feel-good/ui/hooks/use-mobile";
import { useChatSearchParams } from "@/hooks/use-chat-search-params";
import type { RouteMode } from "@/hooks/use-profile-navigation-effects";
import { DesktopWorkspace } from "./desktop-workspace";
import { MobileWorkspace } from "./mobile-workspace";
import { ContentPanel } from "./content-panel";

type WorkspaceShellProps = {
  interaction: ReactNode;
  content: ReactNode;
};

export function WorkspaceShell({ interaction, content }: WorkspaceShellProps) {
  const isMobile = useIsMobile();
  const segment = useSelectedLayoutSegment();
  const { isChatOpen } = useChatSearchParams();

  const routeMode: RouteMode = segment ? "detail" : "list";

  if (isMobile) {
    return (
      <MobileWorkspace
        routeMode={routeMode}
        isChatOpen={isChatOpen}
        interaction={interaction}
      >
        {content}
      </MobileWorkspace>
    );
  }

  return (
    <DesktopWorkspace interaction={interaction}>
      <ContentPanel routeMode={routeMode}>{content}</ContentPanel>
    </DesktopWorkspace>
  );
}
