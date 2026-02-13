"use client";

import { useArticleWorkspace } from "../context/article-workspace-context";
import { ArticleToolbar } from "../components/article-toolbar";

export function ArticleToolbarView() {
  const ctx = useArticleWorkspace();
  return (
    <ArticleToolbar
      isOwner={ctx.isOwner}
      selectedCount={ctx.selectedCount}
      onDelete={ctx.onDelete}
      sortOrder={ctx.sortOrder}
      onSortChange={ctx.onSortChange}
      search={ctx.search}
      categories={ctx.categories}
      filter={ctx.filter}
    />
  );
}
