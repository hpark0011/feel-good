"use client";

import { ThemeToggleButton } from "@feel-good/features/theme/components";
import { cn } from "@feel-good/utils/cn";
import {
  ContentKindTabs,
  getContentRouteState,
} from "@/features/content";
import { useProfileRouteData } from "@/app/[username]/_providers/profile-route-data-context";
import { useSelectedLayoutSegments } from "next/navigation";

type WorkspaceNavbarProps = {
  className?: string;
};

export function WorkspaceNavbar({ className }: WorkspaceNavbarProps) {
  const segments = useSelectedLayoutSegments();
  const { profile } = useProfileRouteData();
  const routeState = getContentRouteState(segments);

  return (
    <nav
      className={cn(
        "z-10 flex h-10 items-center justify-between gap-2 px-4 bg-linear-to-b from-background via-background/70 to-transparent",
        className,
      )}
    >
      <ContentKindTabs
        username={profile.username}
        currentKind={routeState.kind}
      />
      <ThemeToggleButton />
    </nav>
  );
}
