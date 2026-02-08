"use client";

import { useSession } from "@/lib/auth-client";
import { DashboardView } from "./_view/dashboard-view";
import { MOCK_ARTICLES } from "./articles/_data/mock-articles";
import { useArticleList } from "./articles/_hooks/use-article-list";
import { ArticleListView } from "./articles/_view/article-list-view";

export default function DashboardPage() {
  const { isLoading } = useSession();
  const { articles, hasMore, loadMore } = useArticleList(MOCK_ARTICLES);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-700 dark:border-t-white" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <main className="mx-auto max-w-7xl px-4 py-8">
        <DashboardView />
        <ArticleListView
          articles={articles}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      </main>
    </div>
  );
}
