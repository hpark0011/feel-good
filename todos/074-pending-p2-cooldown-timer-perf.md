---
status: pending
priority: p2
issue_id: "074"
tags: [auth, otp, performance, code-review]
dependencies: []
---

# Fix resendCooldown Timer and Callback Performance

## Problem Statement

Two related performance issues with `resendCooldown`:

1. **Timer churn:** `resendCooldown` is in the `useEffect` dependency array (line 68). Every second the state updates, the effect tears down and recreates the interval — 60 create/destroy cycles per cooldown. Also introduces subtle timing drift.

2. **Memo defeat:** `resendCooldown` is in `resendOTP`'s `useCallback` dependency array (line 153). The callback gets a new identity every second, which propagates through forms → views and causes `React.memo` on `OTPView` to re-render 60 times during each cooldown period.

## Affected Files

- `packages/features/auth/hooks/use-otp-auth.ts` (lines 56-68, 130-153)

## Proposed Solutions

### Option A: Use resendCooldownRef for callback + boolean trigger for effect (Recommended)

```typescript
// Ref for callback guard (follows existing statusRef pattern)
const resendCooldownRef = useRef(resendCooldown);
resendCooldownRef.current = resendCooldown;

// Effect only triggers on 0 ↔ non-zero transition
useEffect(() => {
  if (resendCooldown <= 0) return;
  const interval = setInterval(() => {
    setResendCooldown((prev) => {
      if (prev <= 1) { clearInterval(interval); return 0; }
      return prev - 1;
    });
  }, 1000);
  return () => clearInterval(interval);
}, [resendCooldown > 0]); // only boolean dependency

// Callback uses ref, not state
const resendOTP = useCallback(async () => {
  if (statusRef.current === "loading" || resendCooldownRef.current > 0) return;
  // ...
}, [email, authClient, onError]); // resendCooldown removed
```

**Pros:** Single interval per cooldown, stable callback identity, memo works
**Cons:** One more ref
**Effort:** Small
**Risk:** Low

## Acceptance Criteria

- [ ] Only one interval is created per cooldown period (not 60)
- [ ] `resendOTP` callback identity is stable during countdown
- [ ] `OTPView` memo prevents re-renders during countdown (verify with React DevTools)
- [ ] Timer still counts down correctly and re-enables the resend button

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-06 | Created from PR #104 multi-agent review (performance, races) | resendCooldown in deps defeats both interval stability and React.memo |
