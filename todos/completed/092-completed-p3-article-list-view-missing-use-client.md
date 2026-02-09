---
status: completed
priority: p3
issue_id: "092"
tags: [code-review, typescript, mirror]
dependencies: []
---

# ArticleListView Missing "use client" Directive

## Problem Statement

`ArticleListView` receives `onLoadMore` (a function) as a prop, which means it cannot be a Server Component -- functions are not serializable across the server/client boundary. It works today only because the parent is already `"use client"`, but this is fragile.

## Findings

- **Source:** kieran-typescript-reviewer agent
- **Location:** `apps/mirror/app/(protected)/dashboard/articles/_view/article-list-view.tsx`
- **Evidence:** Component receives `onLoadMore: () => void` prop. Imports client components (`ArticleListItem`, `ArticleListLoader`). No `"use client"` directive.

## Proposed Solutions

### Option A: Add "use client" directive (Recommended)
- Add `"use client"` at top of file
- **Effort:** Trivial
- **Risk:** None

## Acceptance Criteria

- [x] `"use client"` added to `article-list-view.tsx`

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-08 | Created from PR #105 code review | Components receiving function props must be client components |
| 2026-02-09 | Added `"use client"` directive, mirror build verified | Actual path uses `_views/` (plural), not `_view/` |

## Resources

- PR: https://github.com/hpark0011/feel-good/pull/105
