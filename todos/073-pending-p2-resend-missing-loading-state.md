---
status: pending
priority: p2
issue_id: "073"
tags: [auth, otp, race-condition, code-review]
dependencies: ["068"]
---

# Add Loading State to resendOTP

## Problem Statement

`resendOTP` never calls `setStatus("loading")`, unlike `requestOTP` and `verifyOTP`. This means:
1. The `statusRef` guard does not protect against concurrent operations during resend
2. The user can type and submit a stale OTP code while a resend is in flight, causing a race where the old code is verified against a newly rotated OTP
3. The UI (InputOTP, buttons) is not disabled during resend because `isLoading` stays false

Scenario: User clicks "Resend", network is slow (500ms), user types old code, `onComplete` fires `verifyOTP`, resend lands and rotates the OTP, verify request arrives with stale code → "Invalid code" error.

## Affected Files

- `packages/features/auth/hooks/use-otp-auth.ts` (lines 130-153)

## Proposed Solutions

### Option A: Add setStatus("loading") to resendOTP (Recommended)

```typescript
const resendOTP = useCallback(async () => {
  if (statusRef.current === "loading" || resendCooldown > 0) return;
  statusRef.current = "loading"; // sync guard (from #068)
  setStatus("loading");
  setError(null);
  setOtp("");
  // ...
}, [/* deps */]);
```

**Pros:** Consistent with other callbacks, locks UI during resend
**Cons:** Brief loading flash on the verify step
**Effort:** Small
**Risk:** Low

## Acceptance Criteria

- [ ] `resendOTP` sets status to "loading" before the API call
- [ ] InputOTP and buttons are disabled during resend
- [ ] User cannot submit a stale code while resend is in flight

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-06 | Created from PR #104 multi-agent review (races reviewer) | Missing loading state allows stale-OTP race condition |
