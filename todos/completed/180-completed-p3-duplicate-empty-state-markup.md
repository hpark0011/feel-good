---
status: completed
priority: p3
issue_id: "180"
tags: [code-review, duplication, ui, mirror]
dependencies: []
---

# Duplicated Empty State Markup in ScrollableArticleList

## Problem Statement

Two nearly identical empty state `<div>` blocks in `ScrollableArticleList` share the same wrapper markup but differ only in message text. Minor duplication that sets a pattern which will accumulate.

## Findings

- **Location:** `apps/mirror/features/articles/components/scrollable-article-list.tsx:12-15, 21-23`
- **Pattern:**
  ```tsx
  <div className="flex items-center justify-center py-16 text-muted-foreground">
    {message}
  </div>
  ```
- **Source:** PR #121 — pattern recognition and code simplicity reviewers flagged this

## Proposed Solutions

Extract a shared inline component or use a helper:

```tsx
function EmptyMessage({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-muted-foreground">
      {message}
    </div>
  );
}
```

- **Effort:** Small
- **Risk:** None

## Acceptance Criteria

- [ ] Empty state markup is not duplicated
- [ ] Both empty states render correctly

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-13 | Created from PR #121 review | Minor duplication, good cleanup candidate |
