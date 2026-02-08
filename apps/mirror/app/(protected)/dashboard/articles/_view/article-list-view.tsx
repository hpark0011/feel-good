import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@feel-good/ui/primitives/table";
import type { Article } from "../_data/mock-articles";
import { ArticleListItem } from "../_components/article-list-item";
import { ArticleListLoader } from "../_components/article-list-loader";

type ArticleListViewProps = {
  articles: Article[];
  hasMore: boolean;
  onLoadMore: () => void;
};

export function ArticleListView({
  articles,
  hasMore,
  onLoadMore,
}: ArticleListViewProps) {
  return (
    <section className="w-full max-w-2xl mx-auto mt-16">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-3/5">Title</TableHead>
            <TableHead className="w-1/5">Category</TableHead>
            <TableHead className="text-right w-1/5">Published</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article) => (
            <ArticleListItem key={article.slug} article={article} />
          ))}
        </TableBody>
      </Table>
      <ArticleListLoader hasMore={hasMore} onLoadMore={onLoadMore} />
    </section>
  );
}
