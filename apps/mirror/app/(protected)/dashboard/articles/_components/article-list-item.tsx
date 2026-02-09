"use client";

import { useRouter } from "next/navigation";
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

export function ArticleListItem({ article }: { article: Article }) {
  const router = useRouter();
  const href = `/dashboard/articles/${article.slug}`;

  return (
    <TableRow
      className="cursor-pointer border-b-0 group-hover/list:text-muted-foreground hover:text-secondary-foreground hover:bg-transparent min-h-[44px]"
      tabIndex={0}
      onClick={() => router.push(href)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(href);
      }}
    >
      <TableCell className="font-medium truncate max-w-0 py-0 text-lg">
        {article.title}
      </TableCell>
      <TableCell className="hidden md:table-cell py-0 font-medium">{article.category}</TableCell>
      <TableCell className="text-right py-0 font-medium">
        <time dateTime={article.published_at}>
          {formatDate(article.published_at)}
        </time>
      </TableCell>
    </TableRow>
  );
}
