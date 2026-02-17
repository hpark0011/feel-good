---
status: pending
priority: p3
issue_id: "235"
tags: [cleanup, todos, docs-reorg]
dependencies: []
---

# Clean Up Stale Session Plans in todo.md

## Problem Statement

`todos/todo.md` is 174 lines of accumulated session plans from past sessions that were never cleared. Only the "Mirror Article List Filter" plan (lines 41-80) has incomplete items. The rest are finished plans that add noise.

## Scope

1. Keep only the incomplete article filter plan (lines 41-80)
2. Add a header explaining the file's purpose:
   ```
   # Session Plan
   Active planning scratchpad. Completed plans tracked in `docs/plans/` and `todos/completed/`.
   ```
3. Remove all completed session plan sections

## Acceptance Criteria

- [ ] `todos/todo.md` contains only one active plan section
- [ ] File has a header explaining its purpose
- [ ] All completed plan text is removed (history preserved in git)

## Plan Reference

`docs/plans/2026-02-17-refactor-docs-config-reorganization-plan.md` — Phase 3.5

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
