---
status: pending
priority: p2
issue_id: "075"
tags: [auth, otp, ux, code-review]
dependencies: []
---

# Reset Cooldown on Resend Failure

## Problem Statement

`resendOTP` sets `setResendCooldown(60)` before the API call (line 134). If the API call fails, the cooldown keeps ticking and the user must wait 60 seconds before retrying, despite the resend never succeeding. This punishes legitimate users for server errors.

## Affected Files

- `packages/features/auth/hooks/use-otp-auth.ts` (lines 130-153)

## Proposed Solutions

### Option A: Move cooldown to onSuccess (Recommended)
Set cooldown only in the `onSuccess` callback. Reset to 0 in `onError`.

### Option B: Reset cooldown in onError
Keep optimistic cooldown but add `setResendCooldown(0)` in the error handler.

**Effort:** Small | **Risk:** Low

## Acceptance Criteria

- [ ] On resend failure, the resend button is re-enabled (cooldown resets to 0)
- [ ] On resend success, 60s cooldown starts as before

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-06 | Created from PR #104 multi-agent review (security, typescript) | Optimistic UI should have rollback on failure |
