---
status: pending
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

## Proposed Solutions

### Option A: Replace with zustand `persist` middleware (Recommended)
Replace the manual `_hydrate/_persist` pattern with zustand's built-in `persist` middleware, which handles hydration, persistence, and serialization automatically.

- **Pros:** Eliminates entire class of "forgot to call hydrate" bugs, removes `loadBoards`/`saveBoards`/`clearBoards` boilerplate
- **Cons:** Slightly different API (async hydration), requires testing
- **Effort:** Medium
- **Risk:** Low

### Option B: Add `_hydrate()` call in `main.tsx` or `App.tsx`
Call `useBoardStore.getState()._hydrate()` at app initialization.

- **Pros:** Minimal change, keeps existing architecture
- **Cons:** Leaves manual hydrate/persist pattern in place, still needs debouncing fix
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] Boards persisted to localStorage are restored on app restart
- [ ] Persistence write and read paths both validated

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-15 | Created from PR #127 code review | All 7 agents identified this as broken persistence |
