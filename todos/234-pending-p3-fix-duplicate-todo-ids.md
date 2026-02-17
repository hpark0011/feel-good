---
status: pending
priority: p3
issue_id: "234"
tags: [cleanup, todos, data-integrity, docs-reorg]
dependencies: []
---

# Fix Duplicate Todo ID Collisions

## Problem Statement

3 todo IDs have collisions where multiple files share the same number, breaking uniqueness.

## Scope

### ID 016 — two files in completed/
- Keep: `016-completed-p2-duplicate-convex-url-in-env-schemas.md`
- Renumber: `016-completed-p2-missing-redirect-validation.md` -> `225-completed-p2-missing-redirect-validation.md`
- Update frontmatter `issue_id: "016"` -> `issue_id: "225"`

### ID 173 — collision between completed/ and pending
- Keep pending: `todos/173-pending-p1-unauthenticated-tavus-api-route.md` (active task)
- Renumber completed: `todos/completed/173-completed-p1-mobile-toolbar-slot-height-regression.md` -> `226-completed-p1-mobile-toolbar-slot-height-regression.md`
- Update frontmatter `issue_id: "173"` -> `issue_id: "226"`

### ID 174 — two files in completed/
- Keep: `174-completed-p2-desktop-h-full-removal.md`
- Renumber: `174-completed-p2-escape-key-stale-closure.md` -> `227-completed-p2-escape-key-stale-closure.md`
- Update frontmatter `issue_id: "174"` -> `issue_id: "227"`

## Acceptance Criteria

- [ ] `ls todos/ todos/completed/ todos/canceled/ | sed 's/-.*//' | sort -n | uniq -d` returns empty
- [ ] Files 225, 226, 227 exist with correct frontmatter
- [ ] Use `git mv` for renames

## Plan Reference

`docs/plans/2026-02-17-refactor-docs-config-reorganization-plan.md` — Phase 3.4

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
