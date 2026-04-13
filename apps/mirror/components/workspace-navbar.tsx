"use client";

import { ThemeToggleButton } from "@feel-good/features/theme/components";
import { cn } from "@feel-good/utils/cn";
import { ProfileTabs } from "@/features/profile-tabs/components/profile-tabs";
import {
  isProfileTabKind,
  type ProfileTabKind,
} from "@/features/profile-tabs/types";
import { DEFAULT_PROFILE_CONTENT_KIND } from "@/features/content";
import { useProfileRouteData } from "@/app/[username]/_providers/profile-route-data-context";
import { useSelectedLayoutSegments } from "next/navigation";

type WorkspaceNavbarProps = {
  className?: string;
};

export function WorkspaceNavbar({ className }: WorkspaceNavbarProps) {
  const segments = useSelectedLayoutSegments();
  const { profile } = useProfileRouteData();
  const currentKind: ProfileTabKind = isProfileTabKind(segments[0])
    ? segments[0]
    : DEFAULT_PROFILE_CONTENT_KIND;

  return (
    <nav
      className={cn(
        "z-10 flex h-12 items-end justify-between gap-2 px-4 relative border-b border-border-subtle",
        className,
      )}
    >
      <div className="flex gap-2 h-full items-end">
        <ProfileTabs
          username={profile.username}
          currentKind={currentKind}
        />
      </div>

      <div className="h-full flex flex-col justify-center">
        <ThemeToggleButton />
      </div>
    </nav>
  );
}
