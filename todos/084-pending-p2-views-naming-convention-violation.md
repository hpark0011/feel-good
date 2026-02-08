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

### Option A: Standardize on `_view/` (singular) everywhere

- Update greyboard and ui-factory to use `_view/`
- **Pros:** Grammatically matches "single view per directory"
- **Cons:** Reverses an established decision (todo #052), larger scope
- **Effort:** Medium
- **Risk:** Low

## Recommended Action

Option A -- Standardize on `_view/` (singular) everywhere

## Technical Details

- **Affected files:**
- Inspect the codebase, change everything to view
- After changing the folder name, test if there are any next js import errors.

## Acceptance Criteria

- [ ] All `_views/` directories renamed to `_view/`
- [ ] All imports updated accordingly
- [ ] Build passes

## Work Log

| Date       | Action                           | Learnings                       |
| ---------- | -------------------------------- | ------------------------------- |
| 2026-02-08 | Created from PR #105 code review | Convention was set in todo #052 |

## Resources

- PR: https://github.com/hpark0011/feel-good/pull/105
- Prior decision: `todos/completed/052-completed-p3-views-vs-view-directory-naming.md`
