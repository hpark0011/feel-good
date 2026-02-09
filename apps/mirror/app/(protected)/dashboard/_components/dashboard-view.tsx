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
    <main className="flex h-screen">
      <div className="relative z-20 h-screen flex w-1/2 flex-col justify-center items-center border-r border-border-subtle">
        <ProfileInfoView profile={profile} />
      </div>
      <div className="relative flex-1 min-w-0 overflow-y-auto px-0 py-12 pb-[80px]">
        <div className="sticky top-0 z-10 left-0 w-full h-3 bg-linear-to-b from-background to-transparent" />
        <DashboardHeader />
        <div className="px-4">
          <ScrollableArticleList articles={articles} />
        </div>
      </div>
    </main>
  );
}
