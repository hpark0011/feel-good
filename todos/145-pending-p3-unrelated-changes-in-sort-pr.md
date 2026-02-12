---
status: pending
priority: p3
issue_id: "145"
tags: [code-review, hygiene, greyboard, mirror]
dependencies: []
---

# Unrelated Changes Bundled in Sort Feature

## Problem Statement

Two changes unrelated to the article sort feature are included in the diff:

1. **Greyboard `list-section.tsx`**: Import reordering + removal of unused `AddTicketButton` import
2. **Mirror `delete-articles-dialog.tsx`**: Dialog width (`max-w-sm` → `max-w-md`) and header margin adjustments

These should be in separate commits to keep the sort feature PR atomic.

## Findings

**Affected Files:**
- `apps/greyboard/features/task-list/components/list-section.tsx` (import reorder, unused import removal)
- `apps/mirror/features/articles/views/delete-articles-dialog.tsx` (CSS class changes)

**Flagged by:** Architecture Strategist, Code Simplicity Reviewer

## Proposed Solutions

### Option A: Separate commits (Recommended)
- Commit 1: `chore(greyboard): remove unused AddTicketButton import`
- Commit 2: `style(mirror): adjust delete articles dialog spacing`
- Commit 3: `feat(mirror): add article sort by published date`
- Effort: Small
- Risk: None

### Option B: Revert unrelated changes from this branch
- Revert the two files and apply them on a separate branch
- Effort: Small
- Risk: None

## Acceptance Criteria

- [ ] Sort feature commit only contains sort-related files

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-12 | Created from code review | Keep PRs atomic — one concern per commit |
