---
status: completed
priority: p3
issue_id: "093"
tags: [code-review, cleanup, mirror]
dependencies: []
---

# Unused React Import and Minor Cleanup Items

## Problem Statement

Several small code quality issues across the PR:

1. `dashboard-header.tsx` has `import React from "react"` that is unused
2. `formatDate` in `article-list-item.tsx` creates a new `Intl.DateTimeFormat` per call (should be hoisted)
3. Duplicate spinner implementations with inconsistent theming (page.tsx uses hardcoded zinc, loader uses semantic tokens)
4. `theme/index.ts` has unnecessary wildcard re-export

## Findings

- **Source:** kieran-typescript-reviewer, pattern-recognition-specialist agents
- **Locations:**
  - `apps/mirror/app/(protected)/_components/dashboard-header.tsx` line 2
  - `apps/mirror/app/(protected)/dashboard/articles/_components/article-list-item.tsx` lines 7-14
  - `apps/mirror/app/(protected)/dashboard/page.tsx` line 16 vs `article-list-loader.tsx` line 42
  - `packages/features/theme/index.ts`

## Proposed Solutions

1. Remove `import React from "react"` from `dashboard-header.tsx`
2. Hoist `Intl.DateTimeFormat` to module scope in `article-list-item.tsx`
3. Unify spinner styling to use semantic color tokens
4. Replace `export * from "./components"` with named export

- **Effort:** Trivial (all items combined)
- **Risk:** None

## Acceptance Criteria

- [x] No unused imports
- [x] DateTimeFormat instance shared at module level
- [x] Spinner styling consistent
- [x] Named exports in theme barrel

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-08 | Created from PR #105 code review | Small cleanups bundled for efficiency |
| 2026-02-09 | Completed all 4 items | Also removed unused React import from article-list-item.tsx; spinner in dashboard-content.tsx (not page.tsx) was the actual location |

## Resources

- PR: https://github.com/hpark0011/feel-good/pull/105
