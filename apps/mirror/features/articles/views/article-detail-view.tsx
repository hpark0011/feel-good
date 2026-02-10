import type { Article } from "../lib/mock-articles";
import { formatLongDate } from "../lib/format-date";

type ArticleDetailViewProps = {
  article: Article;
};

export function ArticleDetailView({ article }: ArticleDetailViewProps) {
  const paragraphs = article.body.split("\n\n");

  return (
    <article className="max-w-2xl mx-auto py-8">
      <div className="mb-6">
        <span className="text-sm font-medium text-muted-foreground">
          {article.category}
        </span>
        <h1 className="text-3xl font-semibold mt-2 leading-tight">
          {article.title}
        </h1>
        <time
          dateTime={article.published_at}
          className="text-sm text-muted-foreground mt-2 block"
        >
          {formatLongDate(article.published_at)}
        </time>
      </div>

      <div className="space-y-4 text-base leading-relaxed">
        {paragraphs.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
