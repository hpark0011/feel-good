"use client";

import { useSession } from "@/lib/auth-client";
import { useMediaQuery } from "@feel-good/ui/hooks/use-media-query";
import { ProfileInfoView } from "./_views/profile-info-view";
import { MobileProfileLayout } from "./_views/mobile-profile-layout";
import { MOCK_ARTICLES } from "./articles/_data/mock-articles";
import { useArticleList } from "./articles/_hooks/use-article-list";
import { ArticleListView } from "./articles/_views/article-list-view";

export default function DashboardPage() {
  const { isLoading } = useSession();
  const { articles, hasMore, loadMore } = useArticleList(MOCK_ARTICLES);
  const isMobile = useMediaQuery("(max-width: 767px)");

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white" />
      </div>
    );
  }

  if (isMobile) {
    return (
      <MobileProfileLayout
        profile={<ProfileInfoView />}
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
      <ProfileInfoView />
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
