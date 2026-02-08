---
status: pending
priority: p2
issue_id: "084"
tags: [code-review, architecture, naming, mirror]
dependencies: []
---

# `_view/` (singular) Violates Established `_views/` (plural) Convention

## Problem Statement

Todo #052 established `_views/` (plural) as the directory naming convention across all apps. Greyboard and UI Factory both use `_views/`. This PR introduces `_view/` (singular) in 3 locations in mirror, creating cross-app inconsistency.

## Findings

- **Source:** architecture-strategist, pattern-recognition-specialist agents
- **Location:**
  - `apps/mirror/app/_view/home-page-view.tsx` (renamed from `_views/`)
  - `apps/mirror/app/(protected)/dashboard/_view/dashboard-view.tsx` (new)
  - `apps/mirror/app/(protected)/dashboard/articles/_view/article-list-view.tsx` (new)
- **Evidence:** Todo #052 (completed) established `_views/` (plural). UI Factory `CLAUDE.md` documents `_views/`. Greyboard uses `_views/`. 8 existing instances of `_views/` vs 3 new `_view/` instances.

## Proposed Solutions

### Option A: Rename to `_views/` (plural) (Recommended)
- Rename all 3 mirror `_view/` directories to `_views/`
- **Pros:** Matches established convention, consistent across all apps
- **Cons:** Minor rename churn
- **Effort:** Small
- **Risk:** Low

### Option B: Standardize on `_view/` (singular) everywhere
- Update greyboard and ui-factory to use `_view/`
- **Pros:** Grammatically matches "single view per directory"
- **Cons:** Reverses an established decision (todo #052), larger scope
- **Effort:** Medium
- **Risk:** Low

## Recommended Action

Option A -- align with the existing `_views/` convention.

## Technical Details

- **Affected files:**
  - `apps/mirror/app/_view/` -> `apps/mirror/app/_views/`
  - `apps/mirror/app/(protected)/dashboard/_view/` -> `_views/`
  - `apps/mirror/app/(protected)/dashboard/articles/_view/` -> `_views/`
  - Update import in `apps/mirror/app/page.tsx`

## Acceptance Criteria

- [ ] All mirror `_view/` directories renamed to `_views/`
- [ ] All imports updated accordingly
- [ ] Build passes

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-08 | Created from PR #105 code review | Convention was set in todo #052 |

## Resources

- PR: https://github.com/hpark0011/feel-good/pull/105
- Prior decision: `todos/completed/052-completed-p3-views-vs-view-directory-naming.md`
