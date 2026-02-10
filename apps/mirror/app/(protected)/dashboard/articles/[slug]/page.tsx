import { notFound } from "next/navigation";
import { findArticleBySlug, ArticleDetailView } from "@/features/articles";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = findArticleBySlug(slug);
  if (!article) notFound();
  return <ArticleDetailView article={article} />;
}
