import { notFound } from "next/navigation";
import { ArticleDetailToolbar, ArticleDetail } from "@/features/articles";
import type { Article } from "@/features/articles/types";
import { fetchAuthQuery } from "@/lib/auth-server";
import { api } from "@feel-good/convex/convex/_generated/api";
import { WorkspaceToolbar } from "@/components/workspace-toolbar-slot";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const article = await fetchAuthQuery(api.articles.queries.getBySlug, {
    username,
    slug,
  });
  if (!article) notFound();

  return (
    <>
      <WorkspaceToolbar>
        <ArticleDetailToolbar username={username} />
      </WorkspaceToolbar>
      <ArticleDetail article={article as Article} />
    </>
  );
}
