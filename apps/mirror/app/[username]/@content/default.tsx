import {
  ArticleListToolbarConnector,
  ScrollableArticleList,
} from "@/features/articles";
import { WorkspaceToolbar } from "@/components/workspace-toolbar-slot";

export default function ContentDefault() {
  return (
    <>
      <WorkspaceToolbar>
        <ArticleListToolbarConnector />
      </WorkspaceToolbar>
      <ScrollableArticleList />
    </>
  );
}
