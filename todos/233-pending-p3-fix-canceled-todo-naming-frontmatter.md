---
status: pending
priority: p3
issue_id: "233"
tags: [cleanup, todos, data-integrity, docs-reorg]
dependencies: []
---

# Fix Canceled Todo File Naming and Frontmatter

## Problem Statement

8 files in `todos/canceled/` have "pending" in the filename instead of "canceled", and their frontmatter has `status: pending` instead of `status: canceled`.

## Scope

Rename and fix frontmatter for these 8 files:

- `100-pending-p2-sign-out-ui-removed-regression.md` -> `100-canceled-p2-...`
- `103-pending-p3-page-size-matches-data-length.md` -> `103-canceled-p3-...`
- `114-pending-p3-render-prop-unstable-reference.md` -> `114-canceled-p3-...`
- `115-pending-p3-cross-route-dashboard-header-import.md` -> `115-canceled-p3-...`
- `127-pending-p2-stale-todo-planning-notes.md` -> `127-canceled-p2-...`
- `137-pending-p2-unrelated-gradient-removal-in-pr.md` -> `137-canceled-p2-...`
- `172-pending-p3-verify-shared-dropdown-styling.md` -> `172-canceled-p3-...`
- `179-pending-p3-portal-flash-on-navigation.md` -> `179-canceled-p3-...`

For each: update frontmatter `status: pending` -> `status: canceled`.

## Acceptance Criteria

- [ ] `ls todos/canceled/ | grep "pending"` returns empty
- [ ] `grep -l "^status: pending" todos/canceled/*.md` returns empty
- [ ] Use `git mv` for renames to preserve history

## Plan Reference

`docs/plans/2026-02-17-refactor-docs-config-reorganization-plan.md` — Phase 3.3

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
