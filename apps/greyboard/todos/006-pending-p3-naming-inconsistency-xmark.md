---
status: pending
priority: p3
issue_id: "006"
tags:
  - code-review
  - icons
  - naming
dependencies: []
---

# Fix XMark vs Xmark Naming Inconsistency

## Problem Statement

Icon naming is inconsistent between `XMark` (PascalCase) and `Xmark` (mixed case), which can cause confusion when importing.

## Findings

**Inconsistent naming:**
- `XMarkBoldIcon` - uses "XMark" (proper PascalCase)
- `XmarkIcon` - uses "Xmark" (mixed case)
- `XmarkSmallIcon` - uses "Xmark"
- `XmarkCircleFillIcon` - uses "Xmark"

**Also:**
- `XCircleFillIcon` - uses "X" prefix
- `XmarkCircleFillIcon` - uses "Xmark" prefix

Both serve similar purposes but have different prefixes.

## Proposed Solutions

### Option 1: Standardize to Xmark (Recommended)
- Rename `XMarkBoldIcon` to `XmarkBoldIcon`
- Keep all other Xmark variants as-is
- **Pros:** Minimal changes (1 icon), consistent
- **Cons:** Minor breaking change
- **Effort:** Small
- **Risk:** Low

### Option 2: Standardize to XMark
- Rename all Xmark variants to use XMark
- `XmarkIcon` -> `XMarkIcon`
- `XmarkSmallIcon` -> `XMarkSmallIcon`
- etc.
- **Pros:** Proper PascalCase
- **Cons:** More breaking changes
- **Effort:** Medium
- **Risk:** Low

### Option 3: Add Aliases
- Keep both naming conventions with aliases
- **Pros:** No breaking changes
- **Cons:** Duplicate exports, confusion
- **Effort:** Small
- **Risk:** Low

## Recommended Action

_(To be filled during triage)_

## Technical Details

**Affected files:**
- `packages/icons/scripts/convert-svgs.ts` - Update ICON_MAPPINGS
- `packages/icons/src/components/x-mark-bold.tsx` - Rename component
- `packages/icons/src/index.ts` - Update export
- `packages/icons/src/types.ts` - Update IconName (if kept)

## Acceptance Criteria

- [ ] All xmark variants use consistent naming
- [ ] No TypeScript errors
- [ ] Documentation updated

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|

## Resources

- Icon mappings: `packages/icons/scripts/convert-svgs.ts` lines 23-192
