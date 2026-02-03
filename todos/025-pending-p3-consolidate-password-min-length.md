---
status: pending
priority: p3
issue_id: "025"
tags: [code-review, duplication, auth]
dependencies: []
---

# Consolidate PASSWORD_MIN_LENGTH Constant

## Problem Statement

`PASSWORD_MIN_LENGTH` is defined in two separate files, violating DRY and risking divergence if one is updated without the other.

## Findings

**Source Agent:** architecture-strategist

**Duplicate Definitions:**
- `packages/features/auth/types.ts` (line 21): `export const PASSWORD_MIN_LENGTH = 8;`
- `packages/features/auth/_lib/schemas/auth.schema.ts` (line 3): `export const PASSWORD_MIN_LENGTH = 8;`

## Proposed Solutions

### Option A: Single source in types.ts, import in schemas (Recommended)
```typescript
// types.ts - keep as source of truth
export const PASSWORD_MIN_LENGTH = 8;

// auth.schema.ts - import from types
import { PASSWORD_MIN_LENGTH } from "../types";
```
- **Pros:** Single source of truth, types.ts is the natural home
- **Cons:** None
- **Effort:** Small
- **Risk:** Low

## Technical Details

**Files to Modify:**
- `packages/features/auth/_lib/schemas/auth.schema.ts` (remove definition, add import)

## Acceptance Criteria

- [ ] PASSWORD_MIN_LENGTH defined only in types.ts
- [ ] Schemas import from types.ts
- [ ] All validation still works correctly

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-03 | Created from code review | Architecture strategist found duplicate constant |

## Resources

- Commit: 72235497
- Branch: feel-good/020326-auth_ui_package
