import {
  ArticleListToolbarConnector,
  ScrollableArticleList,
} from "@/features/articles";
import { WorkspaceToolbar } from "@/components/workspace-toolbar-slot";

export default function ContentPage() {
  return (
    <>
      <WorkspaceToolbar>
        <ArticleListToolbarConnector />
      </WorkspaceToolbar>
      <ScrollableArticleList />
    </>
  );
}
