---
status: pending
priority: p1
issue_id: "209"
tags: [code-review, security, greyboard-desktop, validation]
dependencies: []
---

# Unsafe JSON.parse Cast in importBoard Bypasses Existing Zod Validation

## Problem Statement

The `importBoard` method uses `JSON.parse(json) as PersistedBoardV1` -- an unsafe type assertion that provides zero runtime validation. The `persistedBoardV1Schema` and its `.safeParse()` method already exist and are used correctly in `loadBoards()`. A malicious or malformed JSON file could inject arbitrary properties into the board state.

## Findings

- **Location:** `apps/greyboard-desktop/src/state/board-store.ts:60`
- **Current code:** `const parsed = JSON.parse(json) as PersistedBoardV1`
- **Existing validator:** `persistedBoardV1Schema` in `src/lib/persistence/schema.ts` -- already used in `loadBoards()` at `local-storage.ts:10`
- **Risk:** Malformed data injection, unexpected properties spread into board objects, potential runtime errors from wrong types
- **Flagged by:** Security, Architecture, TypeScript, Pattern Recognition reviewers (all agents)

## Proposed Solutions

### Option A: Use existing Zod schema (Recommended)
```typescript
import { persistedBoardV1Schema } from '../lib/persistence/schema'

importBoard: (json) => {
  try {
    const result = persistedBoardV1Schema.safeParse(JSON.parse(json))
    if (!result.success) {
      console.warn('Failed to import board: invalid format')
      return null
    }
    const board: PersistedBoardV1 = {
      ...result.data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    get().addBoard(board)
    return board
  } catch {
    console.warn('Failed to import board: invalid JSON')
    return null
  }
}
```

- **Pros:** Uses existing infrastructure, validates at runtime, consistent with `loadBoards()` pattern
- **Cons:** None
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] `importBoard` validates JSON against `persistedBoardV1Schema` before creating board
- [ ] Invalid JSON files are rejected gracefully with console warning
- [ ] No `as` type assertions on untrusted data

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-15 | Created from PR #127 code review | Validation infrastructure exists but is bypassed on import path |
