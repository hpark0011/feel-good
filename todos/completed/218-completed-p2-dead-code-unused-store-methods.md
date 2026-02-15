---
status: pending
priority: p2
issue_id: "218"
tags: [code-review, greyboard-desktop, dead-code, yagni]
dependencies: []
---

# Dead Code: Unused Store Methods and Persistence Functions

## Problem Statement

Several store methods and persistence functions are defined but never called anywhere in the codebase. This is premature scaffolding that adds maintenance burden without value.

## Findings

- `getSelectedBoard()` - defined at `board-store.ts:17,81-84`, zero call sites
- `selectBoard()` + `selectedBoardId` - defined at `board-store.ts:14,54-56`, never called by any component
- `clearBoards()` - defined at `local-storage.ts:31-33`, never called
- `isAvailable()` - defined at `src/lib/ipc/client.ts:47`, never called
- **Flagged by:** Code Simplicity reviewer

## Proposed Solutions

Remove unused code. Add back when needed (YAGNI).

- **Effort:** Small
- **Risk:** None

## Acceptance Criteria

- [ ] No dead store methods or unused functions

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-15 | Created from PR #127 code review | ~25-35 lines of dead code identified |
