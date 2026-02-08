---
status: pending
priority: p3
issue_id: "089"
tags: [code-review, performance, mirror]
dependencies: []
---

# ArticleListItem Missing React.memo (Re-renders All Rows on Pagination)

## Problem Statement

When `loadMore` triggers and `page` state increments, the `articles` array reference changes (`.slice()` returns new array). This re-renders every `ArticleListItem` including already-visible ones. The auth package views all use `React.memo` wrapping as an established pattern.

## Findings

- **Source:** performance-oracle, pattern-recognition-specialist agents
- **Location:** `apps/mirror/app/(protected)/dashboard/articles/_components/article-list-item.tsx`
- **Evidence:** Memory notes: "All views already use `React.memo` wrapping." No memo on `ArticleListItem`. Article objects are referentially stable (from static const array), so memo comparison would correctly skip re-renders.

## Proposed Solutions

### Option A: Wrap in React.memo (Recommended)
```typescript
export const ArticleListItem = React.memo(function ArticleListItem({ article }: { article: Article }) {
  // ...
});
```
- **Effort:** Trivial
- **Risk:** None

## Acceptance Criteria

- [ ] `ArticleListItem` wrapped in `React.memo`
- [ ] Previously visible rows don't re-render on pagination

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-08 | Created from PR #105 code review | Follow established memo pattern from auth views |

## Resources

- PR: https://github.com/hpark0011/feel-good/pull/105
