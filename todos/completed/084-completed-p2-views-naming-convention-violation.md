---
status: completed
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

## Resolution

**Standardized on `_views/` (plural)** — the opposite of the original recommendation (Option A).

Rationale:
- `_views/` was explicitly decided in Todo #052 (completed)
- 8 existing plural instances vs 3 singular (Mirror only)
- Consistent with all other private folders: `_components/`, `_hooks/`, `_utils/`
- Fixing 3 dirs in Mirror is less disruptive than changing 8+ across Greyboard + UI-Factory

## Acceptance Criteria

- [x] All `_view/` directories in Mirror renamed to `_views/`
- [x] All imports updated accordingly
- [x] Build passes
- [x] Convention documented in `.claude/rules/folder-structure.md`

## Work Log

| Date       | Action                           | Learnings                       |
| ---------- | -------------------------------- | ------------------------------- |
| 2026-02-08 | Created from PR #105 code review | Convention was set in todo #052 |
| 2026-02-09 | Resolved: plural wins, Mirror dirs renamed | Less disruptive to fix 3 vs 8+ |

## Resources

- PR: https://github.com/hpark0011/feel-good/pull/105
- Prior decision: `todos/completed/052-completed-p3-views-vs-view-directory-naming.md`
- Convention doc: `.claude/rules/folder-structure.md`
