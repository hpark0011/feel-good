---
status: pending
priority: p2
issue_id: "212"
tags: [code-review, architecture, greyboard-desktop, dry]
dependencies: []
---

# IPC Channel Strings Duplicated Between Preload and Handlers

## Problem Statement

IPC channel strings are defined in the preload `CHANNELS` constant AND duplicated as inline string literals in each handler file's `ipcMain.handle()` call. A typo in either location would silently cause an IPC channel mismatch with no type-safety to catch it.

## Findings

- **Preload:** `apps/greyboard-desktop/electron/preload.ts:3-11` (CHANNELS const)
- **Handlers:** `electron/ipc/app.ts:4`, `electron/ipc/files.ts:6,23`, `electron/ipc/notifications.ts:5`, `electron/ipc/updates.ts:12`
- **Count:** 7 channel names, each duplicated across 2 files
- **Risk:** Silent IPC failure on mismatch (invoke resolves with `undefined`, no error thrown)
- **Flagged by:** Pattern Recognition, Architecture, TypeScript reviewers

## Proposed Solutions

### Option A: Shared channels constant file (Recommended)
Create `electron/lib/channels.ts` imported by both preload and handler files.

- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] Single source of truth for all IPC channel strings
- [ ] Both preload and handlers import from the same constant

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-15 | Created from PR #127 code review | DRY violation with silent failure mode |
