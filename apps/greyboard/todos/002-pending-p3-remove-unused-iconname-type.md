---
status: pending
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

## Findings

**Location of type definition:**
- `packages/icons/src/types.ts` (lines 18-183)

**Unused import:**
- `apps/greyboard/types/board.types.ts` line 1:
```typescript
import type { IconName } from "@feel-good/icons"; // Imported but never used
```

The `Column` interface uses `ComponentType<SVGProps<SVGSVGElement>>` directly, not `IconName`.

## Proposed Solutions

### Option 1: Remove Completely (Recommended)
- Remove `IconName` type from `types.ts`
- Remove export from `index.ts`
- Remove unused import from `board.types.ts`
- **Pros:** Removes ~165 lines of dead code
- **Cons:** Cannot use string-based icon lookup
- **Effort:** Small
- **Risk:** Low

### Option 2: Keep for Future Use
- Remove only the unused import in `board.types.ts`
- Keep type for potential future dynamic icon lookup
- **Pros:** Type available if needed later
- **Cons:** YAGNI violation
- **Effort:** Trivial
- **Risk:** None

## Recommended Action

_(To be filled during triage)_

## Technical Details

**Affected files:**
- `packages/icons/src/types.ts` - Remove IconName union
- `packages/icons/src/index.ts` - Remove IconName export
- `apps/greyboard/types/board.types.ts` - Remove unused import

## Acceptance Criteria

- [ ] IconName type removed from types.ts
- [ ] IconName export removed from index.ts
- [ ] Unused import removed from board.types.ts
- [ ] TypeScript builds without errors

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|

## Resources

- Types file: `packages/icons/src/types.ts`
- Board types: `apps/greyboard/types/board.types.ts`
