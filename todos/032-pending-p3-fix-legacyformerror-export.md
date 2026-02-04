---
status: pending
priority: p3
issue_id: "032"
tags: [code-review, exports, auth]
dependencies: []
---

# Fix Missing LegacyFormError Export

## Problem Statement

`LegacyFormError` is exported from `components/shared/index.ts` but not re-exported in `components/index.ts`, making it inaccessible via the main components barrel.

## Findings

**Source Agent:** pattern-recognition-specialist

**Current exports:**
```typescript
// components/shared/index.ts line 1
export { FormError, LegacyFormError } from "./form-error";

// components/index.ts line 24
export { FormError } from "./form-error";  // Missing LegacyFormError
```

## Proposed Solutions

### Option A: Add LegacyFormError to components/index.ts
```typescript
// components/index.ts
export { FormError, LegacyFormError } from "./form-error";
```
- **Pros:** Complete exports
- **Cons:** Exposes "legacy" component
- **Effort:** Small
- **Risk:** Low

### Option B: Remove LegacyFormError entirely
- **Pros:** Cleaner API, no "legacy" in new code
- **Cons:** May break consumers (unlikely for new component)
- **Effort:** Small
- **Risk:** Low

## Recommended Action

Option B - A brand new codebase shouldn't have "legacy" wrappers. Remove it.

## Technical Details

**Files to Modify:**
- `packages/features/auth/components/shared/form-error.tsx` (remove LegacyFormError)
- `packages/features/auth/components/shared/index.ts` (remove export)

OR

- `packages/features/auth/components/index.ts` (add export)

## Acceptance Criteria

- [ ] LegacyFormError either exported consistently or removed
- [ ] No orphaned exports
- [ ] Consumers updated if necessary

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-03 | Created from code review | Pattern recognition found orphaned export |

## Resources

- Commit: 72235497
- Branch: feel-good/020326-auth_ui_package
