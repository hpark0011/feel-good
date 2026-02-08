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
      <h2 className="text-xl font-semibold mb-4">Articles</h2>
      <div>
        {articles.map((article) => (
          <ArticleListItem key={article.slug} article={article} />
        ))}
      </div>
      <ArticleListLoader hasMore={hasMore} onLoadMore={onLoadMore} />
    </section>
  );
}
