---
status: pending
priority: p3
issue_id: "232"
tags: [cleanup, todos, data-integrity, docs-reorg]
dependencies: []
---

# Fix Completed Todo File Naming and Frontmatter

## Problem Statement

8 files in `todos/completed/` have wrong status words in filenames ("pending" or "done" instead of "completed"). 12 files have wrong frontmatter status (`done` or `pending` instead of `completed`).

## Scope

### Rename 8 files (filename status word -> "completed")

- `006-done-p2-sync-email-blocking.md` -> `006-completed-p2-sync-email-blocking.md`
- `011-done-p2-hardcoded-error-message.md` -> `011-completed-p2-hardcoded-error-message.md`
- `013-done-p3-extract-form-components.md` -> `013-completed-p3-extract-form-components.md`
- `020-pending-p2-clear-password-after-auth.md` -> `020-completed-p2-clear-password-after-auth.md`
- `034-pending-p2-hide-dock-on-activation-area-leave.md` -> `034-completed-p2-hide-dock-on-activation-area-leave.md`
- `058-pending-p3-max-w-mismatch-suspense-fallback.md` -> `058-completed-p3-max-w-mismatch-suspense-fallback.md`
- `111-pending-p3-barrel-exports-over-expose.md` -> `111-completed-p3-barrel-exports-over-expose.md`
- `118-pending-p3-raf-after-unmount-guard.md` -> `118-completed-p3-raf-after-unmount-guard.md`

### Fix frontmatter status

**`status: done` -> `status: completed`** (9 files):
004, 006, 008, 011, 013, 020, 034, 036, 037

**`status: pending` -> `status: completed`** (3 files):
086, 087, 118

## Acceptance Criteria

- [ ] `ls todos/completed/ | grep -E "pending|done"` returns empty
- [ ] `grep -l "^status: done" todos/completed/*.md` returns empty
- [ ] `grep -l "^status: pending" todos/completed/*.md` returns empty
- [ ] Use `git mv` for renames to preserve history

## Plan Reference

`docs/plans/2026-02-17-refactor-docs-config-reorganization-plan.md` — Phase 3.1 + 3.2

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
