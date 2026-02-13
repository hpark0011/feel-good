import {
  ArticleToolbarView,
  ArticleWorkspaceProvider,
  MOCK_ARTICLES,
  ScrollableArticleList,
} from "@/features/articles";
import { isAuthenticated } from "@/lib/auth-server";
import { WorkspaceToolbar } from "@/components/workspace-toolbar-slot";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const isOwner = await isAuthenticated();
  const articles = isOwner
    ? MOCK_ARTICLES
    : MOCK_ARTICLES.filter((a) => a.status === "published");
  return (
    <ArticleWorkspaceProvider articles={articles} username={username}>
      <WorkspaceToolbar>
        <ArticleToolbarView />
      </WorkspaceToolbar>
      <ScrollableArticleList />
    </ArticleWorkspaceProvider>
  );
}
