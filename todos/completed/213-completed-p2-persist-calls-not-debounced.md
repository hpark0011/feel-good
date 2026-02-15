---
status: completed
priority: p2
issue_id: "213"
tags: [code-review, performance, greyboard-desktop, state-management]
dependencies: ["208"]
---

# Synchronous _persist() Calls Without Debouncing

## Problem Statement

Every store mutation (`addBoard`, `removeBoard`, `updateBoard`) synchronously calls `_persist()` which runs `JSON.stringify` + `localStorage.setItem`. Both are blocking operations. With large board data, this causes UI jank (20-45ms blocking at ~5MB). No debouncing means rapid mutations (e.g., bulk import) trigger full serialize-and-write on every call.

## Findings

- **Location:** `apps/greyboard-desktop/src/state/board-store.ts:31,42,52`
- **Scalability:** 50 boards (~500KB) = ~8ms per persist; 200 boards (~2MB) = ~20ms; 500 boards = ~40ms+
- **localStorage limit:** 5-10MB depending on Electron/Chromium version
- **Flagged by:** Performance Oracle

## Proposed Solutions

### Option A: Debounce _persist() (Quick fix)
Add a 300ms debounce window to collapse rapid mutations into a single write.

- **Effort:** Small
- **Risk:** Low

### Option B: Use zustand `persist` middleware (Better, linked to #208)
Replaces manual hydrate/persist entirely. Handles debouncing, hydration, and serialization.

- **Effort:** Medium
- **Risk:** Low

## Acceptance Criteria

- [ ] Rapid mutations do not trigger a localStorage write per mutation
- [ ] Single debounced write after mutations settle

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-15 | Created from PR #127 code review | JSON.stringify + localStorage.setItem are synchronous blocking calls |
