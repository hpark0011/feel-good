---
status: pending
priority: p3
issue_id: "181"
tags: [code-review, architecture, performance, mirror]
dependencies: []
---

# Consider Splitting ArticleWorkspaceContext When Feature Grows

## Problem Statement

`ArticleWorkspaceContext` bundles 22 fields across 3 concerns (toolbar, list, empty state) into a single context. Any value change re-renders all consumers. Currently there are only 2 consumers (`ArticleToolbarView`, `ScrollableArticleList`), so the blast radius is limited. But adding more consumers or features will make cross-concern re-renders a measurable bottleneck.

## Findings

- **Location:** `apps/mirror/features/articles/context/article-workspace-context.tsx`
- **Current consumers:** 2 (toolbar view, scrollable list)
- **Context value fields:** 22
- **useMemo dependency entries:** ~20
- **Natural split boundary:** Already documented in type comments — "Toolbar state", "List state", "Empty state"
- **Source:** PR #121 — performance, architecture, and simplicity reviewers all noted this. Consensus: acceptable NOW, flag for future.

## Proposed Solutions

When the time comes, split into 2-3 focused contexts:

```
ArticleToolbarContext  — isOwner, sortOrder, onSortChange, search, filter, categories, selectedCount, onDelete
ArticleListContext     — articles, hasMore, onLoadMore, username, selection state, shouldAnimate, empty state
```

Both providers can live in the same `ArticleWorkspaceProvider` component — just provide separate context values.

- **Effort:** Medium
- **Risk:** Low — no logic changes, just restructuring

## Acceptance Criteria

- [ ] Split only when a third consumer is added or profiling shows measurable bottleneck
- [ ] After split, toolbar state changes do not re-render list and vice versa
- [ ] Shared state (selectedCount bridging toolbar ↔ list) handled correctly

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-13 | Created from PR #121 review | YAGNI for now — 2 consumers is fine. Revisit when adding more. |
