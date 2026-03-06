"use client";

import type { ReactNode } from "react";
import { useSelectedLayoutSegment } from "next/navigation";
import { useIsMobile } from "@feel-good/ui/hooks/use-mobile";
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
  const contentSegment = useSelectedLayoutSegment("content");

  const routeMode: RouteMode = segment === "chat"
    ? "chat"
    : segment
    ? "detail"
    : "list";

  // Derive content panel mode from @content slot's own segment,
  // not the primary URL segment. This preserves the correct mode
  // when the @content slot retains its previous content during chat nav.
  const contentMode: RouteMode = contentSegment ? "detail" : "list";

  if (isMobile) {
    return (
      <MobileWorkspace routeMode={routeMode} interaction={interaction}>
        {content}
      </MobileWorkspace>
    );
  }

  return (
    <DesktopWorkspace interaction={interaction}>
      <ContentPanel routeMode={contentMode}>{content}</ContentPanel>
    </DesktopWorkspace>
  );
}
