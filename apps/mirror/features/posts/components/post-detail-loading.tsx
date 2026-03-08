export function PostDetailLoading() {
  return (
    <div
      className="animate-pulse space-y-6 px-4 py-8"
      aria-label="Loading post"
      data-testid="post-detail-loading"
    >
      <div className="h-4 w-32 rounded bg-muted" />
      <div className="space-y-3">
        <div className="h-8 w-2/3 rounded bg-muted" />
        <div className="h-8 w-1/2 rounded bg-muted" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-muted" />
        <div className="h-4 w-[92%] rounded bg-muted" />
        <div className="h-4 w-[85%] rounded bg-muted" />
      </div>
    </div>
  );
}
