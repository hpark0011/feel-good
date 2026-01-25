---
status: completed
priority: p3
issue_id: "002"
tags:
  - code-review
  - icons
  - dead-code
dependencies: []
---

# Remove Unused IconName Type and Import

## Problem Statement

The `IconName` union type (165 lines) is generated and exported from `@feel-good/icons`, but it's imported in `board.types.ts` without being used. This is dead code that adds maintenance burden.

## Resolution

**Applied Option 1: Removed completely**

Removed the unused `IconName` type and all references to it.

### Changes Made

1. **`apps/greyboard/types/board.types.ts`** - Removed unused import
2. **`packages/icons/src/types.ts`** - Removed IconName type (165 lines)
3. **`packages/icons/src/index.ts`** - Removed IconName from exports
4. **`packages/icons/scripts/convert-svgs.ts`** - Updated to not generate IconName

### Lines Removed

| File | Lines Removed |
|------|---------------|
| types.ts | ~170 lines |
| board.types.ts | 1 line |
| convert-svgs.ts | ~5 lines |
| **Total** | ~176 lines |

## Acceptance Criteria

- [x] IconName type removed from types.ts
- [x] IconName export removed from index.ts
- [x] Unused import removed from board.types.ts
- [x] TypeScript builds without errors

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2025-01-24 | Removed IconName type and all references | Type was imported but never used - classic YAGNI violation |

## Resources

- Types file: `packages/icons/src/types.ts`
- Board types: `apps/greyboard/types/board.types.ts`
