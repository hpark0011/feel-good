---
status: pending
priority: p2
issue_id: "023"
tags: [code-review, performance, hooks, auth]
dependencies: []
---

# Fix Options Object Causing Unnecessary Re-renders

## Problem Statement

All auth hooks include the `options` object in their useCallback dependency arrays. When consumers pass inline objects (e.g., `onSuccess={() => {}}`), this creates a new reference on every render, causing the submit callback to be recreated unnecessarily.

## Findings

**Source Agent:** performance-oracle

**Affected Files:**
- `packages/features/auth/hooks/use-password-sign-in.ts` (line 79)
- `packages/features/auth/hooks/use-password-sign-up.ts` (line 99)
- `packages/features/auth/hooks/use-forgot-password.ts` (line 76)
- `packages/features/auth/hooks/use-magic-link-request.ts` (line 76)
- `packages/features/auth/hooks/use-reset-password.ts` (line 122)

**Current code:**
```typescript
const submit = useCallback(async () => {
  // ...
  options.onSuccess?.();
  // ...
  options.onError?.(authError);
}, [email, password, authClient, options, status]);  // 'options' causes issues
```

**Impact:** Medium - causes cascading re-renders in complex component trees.

## Proposed Solutions

### Option A: Destructure options and use stable refs (Recommended)
```typescript
export function usePasswordSignIn(
  authClient: AuthClient,
  options: UsePasswordSignInOptions = {}
): UsePasswordSignInReturn {
  const { redirectTo, onSuccess, onError } = options;

  const submit = useCallback(async () => {
    // ...
    onSuccess?.();
    // ...
    onError?.(authError);
  }, [email, password, authClient, onSuccess, onError, status]);
```
- **Pros:** Consumers can pass inline callbacks, React can compare function references
- **Cons:** Slight code change
- **Effort:** Small
- **Risk:** Low

### Option B: Use useRef for callbacks
```typescript
const onSuccessRef = useRef(options.onSuccess);
const onErrorRef = useRef(options.onError);
useEffect(() => {
  onSuccessRef.current = options.onSuccess;
  onErrorRef.current = options.onError;
});
```
- **Pros:** Always uses latest callback
- **Cons:** More complex, ref indirection
- **Effort:** Medium
- **Risk:** Low

### Option C: Document that consumers must memoize callbacks
- **Pros:** No code changes
- **Cons:** Easy to forget, poor DX
- **Effort:** Small
- **Risk:** Medium - consumers will still make mistakes

## Recommended Action

Option A - Destructure at hook level for cleaner dependency tracking.

## Technical Details

**Affected Files:**
- All 5 action hooks in `packages/features/auth/hooks/`

**Expected Performance Gain:** 10-15% reduction in unnecessary re-renders

## Acceptance Criteria

- [ ] Options destructured at hook level
- [ ] useCallback dependency arrays use individual properties
- [ ] Inline callbacks work without causing re-renders
- [ ] All existing functionality preserved

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-03 | Created from code review | Performance oracle identified re-render issue |

## Resources

- Commit: 72235497
- Branch: feel-good/020326-auth_ui_package
