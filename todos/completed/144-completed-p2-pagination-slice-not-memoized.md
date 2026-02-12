---
status: completed
priority: p2
issue_id: "144"
tags: [code-review, performance, react, mirror]
dependencies: []
---

# Pagination Slice Creates New Array Reference Every Render

## Problem Statement

In `use-article-list.ts`, `sorted.slice(0, page * PAGE_SIZE)` runs on every render (not inside a `useMemo`), creating a new array reference each time. This causes cascading re-renders: `allSlugs` recomputes → `useArticleSelection` dependencies change → callbacks recreate.

## Findings

**Affected File:**
- `apps/mirror/features/articles/hooks/use-article-list.ts` (lines 21-22)

```typescript
const articles = sorted.slice(0, page * PAGE_SIZE);
const hasMore = articles.length < sorted.length;
```

**Impact chain:**
1. Any re-render of `ScrollableArticleList`
2. `articles` is a new reference → `allSlugs` recomputes
3. Selection callbacks recreate → `handleDelete` recreates

**Flagged by:** Performance Oracle

## Proposed Solutions

### Option A: Wrap in useMemo (Recommended)
```typescript
const articles = useMemo(
  () => sorted.slice(0, page * PAGE_SIZE),
  [sorted, page],
);
const hasMore = articles.length < sorted.length;
```
- Pros: Breaks the re-render cascade, minimal change
- Cons: None
- Effort: Small (1 line change)
- Risk: None

## Acceptance Criteria

- [ ] `articles` array has stable reference when `sorted` and `page` haven't changed
- [ ] No unnecessary re-renders of child components on hover/interaction

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-12 | Created from code review | Always memoize derived arrays that are passed as props or used in dependency arrays |
