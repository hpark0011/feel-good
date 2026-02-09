import React from "react";
import Link from "next/link";
import { TableRow, TableCell } from "@feel-good/ui/primitives/table";
import type { Article } from "../_data/mock-articles";

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export const ArticleListItem = React.memo(function ArticleListItem({ article }: { article: Article }) {
  const href = `/dashboard/articles/${article.slug}`;

  return (
    <TableRow className="relative border-b-0 group-hover/list:text-muted-foreground hover:text-secondary-foreground hover:bg-transparent min-h-[44px]">
      <TableCell className="font-medium truncate max-w-0 py-0 text-lg">
        <Link href={href} className="after:absolute after:inset-0">
          {article.title}
        </Link>
      </TableCell>
      <TableCell className="hidden md:table-cell py-0 font-medium">{article.category}</TableCell>
      <TableCell className="text-right py-0 font-medium">
        <time dateTime={article.published_at}>
          {formatDate(article.published_at)}
        </time>
      </TableCell>
    </TableRow>
  );
});
