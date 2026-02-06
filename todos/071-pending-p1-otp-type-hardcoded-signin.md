---
status: pending
priority: p1
issue_id: "071"
tags: [auth, otp, bug, code-review]
dependencies: []
---

# Fix Hardcoded type: "sign-in" in OTP Sign-Up Flow

## Problem Statement

`useOTPAuth` hardcodes `type: "sign-in"` in both `requestOTP` (line 77) and `resendOTP` (line 137). This means the sign-up flow sends `type: "sign-in"` to Better Auth, which:
1. Causes the email template to say "sign in to your account" instead of "complete your sign up"
2. May cause Better Auth to handle new (non-existent) users differently for "sign-in" vs "sign-up" type OTPs

## Affected Files

- `packages/features/auth/hooks/use-otp-auth.ts` (lines 77, 137)
- `packages/features/auth/components/forms/otp-login-form.tsx`
- `packages/features/auth/components/forms/otp-sign-up-form.tsx`

## Proposed Solutions

### Option A: Add `type` to UseOTPAuthOptions (Recommended)

```typescript
export interface UseOTPAuthOptions {
  redirectTo?: string;
  type?: "sign-in" | "sign-up";
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
}
```

OTPLoginForm passes `type: "sign-in"`, OTPSignUpForm passes `type: "sign-up"`.

**Pros:** Clean, type-safe, correct email copy per flow
**Cons:** None
**Effort:** Small
**Risk:** Low

## Acceptance Criteria

- [ ] `useOTPAuth` accepts a `type` option defaulting to `"sign-in"`
- [ ] `OTPSignUpForm` passes `type: "sign-up"` to the hook
- [ ] Sign-up OTP emails say "complete your sign up"
- [ ] Sign-in OTP emails say "sign in to your account"

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-06 | Created from PR #104 multi-agent review (architecture, typescript, patterns) | All 3 reviewers independently flagged this as a user-facing bug |
