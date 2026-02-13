"use client";

import { useArticleWorkspace } from "../context/article-workspace-context";
import { useScrollRoot } from "../context/scroll-root-context";
import { ArticleListView } from "../views/article-list-view";

export function ScrollableArticleList() {
  const ctx = useArticleWorkspace();
  const scrollRoot = useScrollRoot();

  if (ctx.hasNoArticles) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        No articles yet
      </div>
    );
  }

  if (ctx.showEmpty) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        {ctx.emptyMessage}
      </div>
    );
  }

  return (
    <ArticleListView
      articles={ctx.articles}
      hasMore={ctx.hasMore}
      onLoadMore={ctx.onLoadMore}
      scrollRoot={scrollRoot}
      username={ctx.username}
      isOwner={ctx.isOwner}
      isAllSelected={ctx.isAllSelected}
      isIndeterminate={ctx.isIndeterminate}
      onToggleAll={ctx.onToggleAll}
      isSelected={ctx.isSelected}
      onToggle={ctx.onToggle}
      shouldAnimate={ctx.shouldAnimate}
    />
  );
}
