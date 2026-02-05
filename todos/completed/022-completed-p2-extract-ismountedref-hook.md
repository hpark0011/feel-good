---
status: completed
priority: p2
issue_id: "022"
tags: [code-review, duplication, hooks, auth]
dependencies: []
---

# Extract Duplicated isMountedRef Pattern to Shared Hook

## Problem Statement

The isMountedRef pattern for preventing state updates on unmounted components is duplicated identically across all 5 auth hooks (35 lines of duplicate code).

## Findings

**Source Agent:** pattern-recognition-specialist

**Duplicated Pattern (7 lines x 5 hooks = 35 LOC):**
```typescript
// Race condition prevention: track if component is mounted
const isMountedRef = useRef(true);
useEffect(() => {
  isMountedRef.current = true;
  return () => {
    isMountedRef.current = false;
  };
}, []);
```

**Locations:**
- `packages/features/auth/hooks/use-password-sign-in.ts` (lines 44-50)
- `packages/features/auth/hooks/use-password-sign-up.ts` (lines 51-57)
- `packages/features/auth/hooks/use-magic-link-request.ts` (lines 41-47)
- `packages/features/auth/hooks/use-forgot-password.ts` (lines 41-47)
- `packages/features/auth/hooks/use-reset-password.ts` (lines 53-59)

## Proposed Solutions

### Option A: Extract to shared hook (Recommended)
```typescript
// packages/features/auth/hooks/_lib/use-mounted-ref.ts
export function useMountedRef() {
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  return isMountedRef;
}

// Usage in hooks:
const isMountedRef = useMountedRef();
```
- **Pros:** DRY, single source of truth, easier to maintain
- **Cons:** Additional import
- **Effort:** Small
- **Risk:** Low

### Option B: Use existing utility library
- **Pros:** No new code
- **Cons:** May not exist, adds dependency
- **Effort:** Small
- **Risk:** Low

## Recommended Action

Option A - Extract to `_lib/use-mounted-ref.ts` and update all hooks.

## Technical Details

**New File:**
- `packages/features/auth/hooks/_lib/use-mounted-ref.ts`

**Files to Update:**
- `packages/features/auth/hooks/use-password-sign-in.ts`
- `packages/features/auth/hooks/use-password-sign-up.ts`
- `packages/features/auth/hooks/use-magic-link-request.ts`
- `packages/features/auth/hooks/use-forgot-password.ts`
- `packages/features/auth/hooks/use-reset-password.ts`

**LOC Savings:** ~28 lines (35 - 7 for shared hook)

## Acceptance Criteria

- [x] Shared useMountedRef hook created
- [x] All 5 auth hooks updated to use shared hook
- [x] Race condition prevention still works correctly
- [x] No regressions in unmount handling

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-03 | Created from code review | Pattern recognition found 5x duplication |
| 2026-02-04 | Implemented shared hook | Created `_lib/use-mounted-ref.ts`, updated all 5 hooks, saved ~28 LOC |

## Resources

- Commit: 72235497
- Branch: feel-good/020326-auth_ui_package
