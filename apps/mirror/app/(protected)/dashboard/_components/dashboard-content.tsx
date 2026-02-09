"use client";

import { useMediaQuery } from "@feel-good/ui/hooks/use-media-query";
import { MobileProfileLayout } from "@/features/profile";
import { useArticleList, ArticleListView } from "@/features/articles";
import type { Article } from "@/features/articles";

type DashboardContentProps = {
  profile: React.ReactNode;
  articles: Article[];
};

export function DashboardContent({
  profile,
  articles: allArticles,
}: DashboardContentProps) {
  const { articles, hasMore, loadMore } = useArticleList(allArticles);
  const isMobile = useMediaQuery("(max-width: 767px)");

  if (isMobile) {
    return (
      <MobileProfileLayout
        profile={profile}
        content={(scrollRoot) => (
          <div className="px-3">
            <ArticleListView
              articles={articles}
              hasMore={hasMore}
              onLoadMore={loadMore}
              scrollRoot={scrollRoot}
            />
          </div>
        )}
      />
    );
  }

  return (
    <main className="flex h-screen gap-4">
      {profile}
      <div className="flex-1 min-w-0 overflow-y-auto py-12 pb-[200px]">
        <ArticleListView
          articles={articles}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </div>
    </main>
  );
}
