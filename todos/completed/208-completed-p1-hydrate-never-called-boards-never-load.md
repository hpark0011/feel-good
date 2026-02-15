---
status: completed
priority: p1
issue_id: "208"
tags: [code-review, bug, greyboard-desktop, state-management]
dependencies: []
---

# _hydrate() Never Called - Boards Never Load from localStorage

## Problem Statement

The Zustand board store defines `_hydrate()` to load boards from localStorage, but it is never invoked anywhere in the codebase. The store initializes with `boards: []`, and while `_persist()` writes boards to localStorage after every mutation, the data is never read back on app startup. This makes persistence write-only -- a functional bug.

## Findings

- **Location:** `apps/greyboard-desktop/src/state/board-store.ts:86-89` (`_hydrate` definition)
- **Evidence:** Zero call sites for `_hydrate` across the entire app (no `useEffect`, no call in `main.tsx` or `App.tsx`)
- **Impact:** Boards saved via import/export are lost on app restart
- **Flagged by:** Architecture, Pattern Recognition, Code Simplicity, Git History, TypeScript reviewers (6/7 agents)

## Resolution

Implemented **Option A: zustand `persist` middleware**.

- Replaced manual `_hydrate()` / `_persist()` pattern with zustand's built-in `persist` middleware
- Created custom `boardStorage` adapter that preserves Zod validation on read and the version-wrapped `BoardList` format on write
- Removed `_hydrate` and `_persist` from the store interface — hydration is now automatic
- Removed manual `get()._persist()` calls from every mutation — persist middleware handles this
- Deleted `lib/persistence/local-storage.ts` (no remaining consumers — `clearBoards` had zero call sites)
- Same storage key (`greyboard-desktop:boards`) ensures backward compatibility with existing data

## Acceptance Criteria

- [x] Boards persisted to localStorage are restored on app restart
- [x] Persistence write and read paths both validated

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-15 | Created from PR #127 code review | All 7 agents identified this as broken persistence |
| 2026-02-15 | Fixed via zustand persist middleware | Custom storage adapter preserves Zod validation + version envelope |
