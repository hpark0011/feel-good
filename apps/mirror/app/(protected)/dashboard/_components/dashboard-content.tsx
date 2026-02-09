"use client";

import { useSession } from "@/lib/auth-client";
import { useMediaQuery } from "@feel-good/ui/hooks/use-media-query";
import { MobileProfileLayout } from "../_views/mobile-profile-layout";
import type { Article } from "../articles/_data/mock-articles";
import { useArticleList } from "../articles/_hooks/use-article-list";
import { ArticleListView } from "../articles/_views/article-list-view";

type DashboardContentProps = {
  profile: React.ReactNode;
  articles: Article[];
};

export function DashboardContent({
  profile,
  articles: allArticles,
}: DashboardContentProps) {
  const { isLoading } = useSession();
  const { articles, hasMore, loadMore } = useArticleList(allArticles);
  const isMobile = useMediaQuery("(max-width: 767px)");

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted-foreground/20 border-t-muted-foreground" />
      </div>
    );
  }

  if (isMobile) {
    return (
      <MobileProfileLayout
        profile={profile}
        content={(scrollContainerRef) => (
          <div className="px-3">
            <ArticleListView
              articles={articles}
              hasMore={hasMore}
              onLoadMore={loadMore}
              scrollContainerRef={scrollContainerRef}
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
