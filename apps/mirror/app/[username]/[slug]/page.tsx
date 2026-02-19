import { notFound } from "next/navigation";
import {
  ArticleDetailToolbar,
  ArticleDetail,
  findArticleBySlug,
} from "@/features/articles";
import { isAuthenticated } from "@/lib/auth-server";
import { WorkspaceToolbar } from "@/components/workspace-toolbar-slot";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ username: string; slug: string }>;
}) {
  const { username, slug } = await params;
  const article = findArticleBySlug(slug);
  if (!article) notFound();
  if (article.status === "draft" && !(await isAuthenticated())) notFound();
  return (
    <>
      <WorkspaceToolbar>
        <ArticleDetailToolbar username={username} />
      </WorkspaceToolbar>
      <ArticleDetail article={article} />
    </>
  );
}
