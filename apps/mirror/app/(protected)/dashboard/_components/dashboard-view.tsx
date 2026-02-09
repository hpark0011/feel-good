"use client";

import type { Article } from "@/features/articles";
import { ScrollableArticleList } from "@/features/articles";
import type { Profile } from "@/features/profile";
import { MobileProfileLayout, ProfileInfoView } from "@/features/profile";
import { useIsMobile } from "@feel-good/ui/hooks/use-mobile";
import { DashboardHeader } from "./dashboard-header";

type DashboardViewProps = {
  profile: Profile;
  articles: Article[];
};

export function DashboardView(
  { profile, articles }: DashboardViewProps,
) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileProfileLayout
        profile={<ProfileInfoView profile={profile} />}
        content={(scrollRoot) => (
          <div className="px-3">
            <ScrollableArticleList
              articles={articles}
              scrollRoot={scrollRoot}
            />
          </div>
        )}
      />
    );
  }

  return (
    <main className="flex h-screen gap-0">
      <ProfileInfoView profile={profile} />
      <div className="flex-1 min-w-0 overflow-y-auto px-4 py-12 pb-[200px]">
        <DashboardHeader />
        <ScrollableArticleList articles={articles} />
      </div>
    </main>
  );
}
