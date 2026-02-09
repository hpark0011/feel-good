---
status: pending
priority: p3
issue_id: "106"
tags: [code-review, architecture, mirror]
dependencies: []
---

# Dashboard Imports From Articles Private Directories

## Problem Statement

`dashboard-content.tsx` imports `Article` type, `useArticleList`, and `ArticleListView` from `articles/_data/`, `articles/_hooks/`, and `articles/_views/`. The underscore convention marks these as route-private, but they are consumed from outside the route.

## Findings

- **Source:** pattern-recognition-specialist agent
- **Location:** `dashboard/_components/dashboard-content.tsx` lines 6-8

## Proposed Solutions

### Option A: Create barrel export in articles/ (Recommended)
- Add `articles/index.ts` that exports the public API
- **Effort:** Small
- **Risk:** Low

### Option B: Elevate shared items to dashboard level
- Move type, hook, and view to `dashboard/_*` directories
- **Effort:** Medium

## Acceptance Criteria

- [ ] No direct imports from child route's private directories
- [ ] Article type accessible without importing from mock data file

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-09 | Created from PR #105 round 2 review | Respect private directory encapsulation |

## Resources

- PR: https://github.com/hpark0011/feel-good/pull/105
