"use client";

import { useIsMobile } from "@feel-good/ui/hooks/use-mobile";
import { MobileProfileLayout } from "@/features/profile";
import { ScrollableArticleList } from "@/features/articles";
import type { Article } from "@/features/articles";

type DashboardViewProps = {
  profile: React.ReactNode;
  articles: Article[];
};

export function DashboardView({ profile, articles }: DashboardViewProps) {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileProfileLayout
        profile={profile}
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
      {profile}
      <div className="flex-1 min-w-0 overflow-y-auto px-4 py-12 pb-[200px]">
        <ScrollableArticleList articles={articles} />
      </div>
    </main>
  );
}
