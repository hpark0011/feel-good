import { PostListToolbar, ScrollablePostList } from "@/features/posts";
import { WorkspaceToolbar } from "@/components/workspace-toolbar-slot";

export default function PostsContentPage() {
  return (
    <>
      <WorkspaceToolbar>
        <PostListToolbar />
      </WorkspaceToolbar>
      <ScrollablePostList />
    </>
  );
}
