import Link from "next/link";
import type { Article } from "../_data/mock-articles";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function ArticleListItem({ article }: { article: Article }) {
  return (
    <Link
      href={`/dashboard/articles/${article.slug}`}
      className="group flex items-baseline justify-between gap-4 border-b border-border py-4 transition-colors hover:bg-muted/50 px-2 -mx-2 rounded-sm"
    >
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-medium group-hover:underline truncate">
          {article.title}
        </h3>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-sm text-muted-foreground">
        <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
          {article.category}
        </span>
        <time dateTime={article.published_at}>
          {formatDate(article.published_at)}
        </time>
      </div>
    </Link>
  );
}
