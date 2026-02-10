import { ScrollableArticleList, MOCK_ARTICLES } from "@/features/articles";

export default function DashboardPage() {
  return <ScrollableArticleList articles={MOCK_ARTICLES} />;
}
