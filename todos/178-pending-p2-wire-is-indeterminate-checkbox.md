---
status: pending
priority: p2
issue_id: "178"
tags: [code-review, dead-code, ui, mirror]
dependencies: []
---

# isIndeterminate Computed But Never Wired to Checkbox

## Problem Statement

`isIndeterminate` is computed in `useArticleSelection`, passed through `ArticleWorkspaceContext`, and declared in `ArticleListView`'s props — but never actually used. The select-all Checkbox renders `checked={isAllSelected && true}` without passing the indeterminate state. This is either dead code or an incomplete feature.

## Findings

- **Location (computation):** `apps/mirror/features/articles/hooks/use-article-selection.ts:36`
- **Location (context):** `apps/mirror/features/articles/context/article-workspace-context.tsx:42,177`
- **Location (unused):** `apps/mirror/features/articles/views/article-list-view.tsx:23,42` — declared in type, destructured but not used
- **Source:** PR #121 — pattern recognition and TypeScript reviewers flagged this

## Proposed Solutions

### Option A: Wire it to the Checkbox (Recommended)
Pass `indeterminate` prop to the select-all Checkbox in `ArticleListView`.

```tsx
<Checkbox
  checked={isAllSelected}
  indeterminate={isIndeterminate}
  onCheckedChange={onToggleAll}
/>
```

- **Effort:** Small
- **Risk:** None — standard checkbox UX pattern

### Option B: Remove it
If the tri-state checkbox isn't wanted, remove `isIndeterminate` from the selection hook, context, and view type.

- **Effort:** Small
- **Risk:** None

## Acceptance Criteria

- [ ] `isIndeterminate` is either wired to the Checkbox or removed entirely
- [ ] No dead code remains in the chain

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-13 | Created from PR #121 review | Dead prop chain spanning 3 files |
