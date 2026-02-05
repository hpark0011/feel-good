---
status: pending
priority: p3
issue_id: "057"
tags: [code-review, pr-103, auth, hooks, performance]
dependencies: ["023"]
---

# Use statusRef Instead of status in useCallback Dependencies

## Problem Statement

All five auth hooks include `status` in the `useCallback` dependency array for the `submit` function. This means every status transition (idle -> loading -> success/error) recreates the callback, even though `status` is only used as a guard check.

## Findings

**Source:** PR #103 performance review

**Affected Files:**
- `packages/features/auth/hooks/use-password-sign-up.ts`
- `packages/features/auth/hooks/use-password-sign-in.ts`
- `packages/features/auth/hooks/use-magic-link-request.ts`
- `packages/features/auth/hooks/use-forgot-password.ts`
- `packages/features/auth/hooks/use-reset-password.ts`

**Details:**
```typescript
const submit = useCallback(async () => {
  if (status === "loading") return;  // guard only
  // ...
}, [email, password, authClient, options, status]);  // status causes recreation
```

Each form submission triggers 2-3 extra callback recreations (idle->loading, loading->success/error).

## Proposed Solutions

### Option A: Use a ref for the status guard (Recommended)
```typescript
const statusRef = useRef(status);
statusRef.current = status;

const submit = useCallback(async () => {
  if (statusRef.current === "loading") return;
  // ...
}, [email, password, authClient, onSuccess, onError]);
```
- **Pros:** Eliminates unnecessary callback recreations
- **Cons:** Slightly more code
- **Effort:** Small
- **Risk:** None

## Acceptance Criteria

- [ ] `status` removed from useCallback dependency arrays in all 5 hooks
- [ ] Status guard uses ref instead
- [ ] No behavioral change in form submission

## Work Log

| Date | Action | Outcome |
|------|--------|---------|
| 2026-02-05 | Created from PR #103 performance review | Pending |
