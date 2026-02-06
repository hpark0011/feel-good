---
status: pending
priority: p1
issue_id: "070"
tags: [auth, security, otp, rate-limiting, code-review]
dependencies: []
---

# Add Rate Limit on OTP Verification Endpoint

## Problem Statement

The `customRules` in the Better Auth rate limit config only throttle OTP *sending* (`/email-otp/send-verification-otp` at 3/60s). The OTP *verification* endpoint falls back to the global default of 10 requests per 60 seconds. With 6-digit OTPs (1M combinations) and a 5-minute expiry, an attacker can make ~50 guesses per OTP lifetime. No `maxAttempts` per-OTP is configured, so failed attempts don't invalidate the code.

## Affected Files

- `packages/convex/convex/auth.ts` (lines 50-58, 72-79)

## Proposed Solutions

### Option A: Add custom rate limit + maxAttempts (Recommended)

```typescript
rateLimit: {
  customRules: {
    "/sign-in/magic-link": { window: 60, max: 3 },
    "/email-otp/send-verification-otp": { window: 60, max: 3 },
    "/sign-in/email-otp": { window: 300, max: 5 }, // 5 attempts per 5-min OTP window
  },
},
// ...
emailOTP({
  otpLength: 6,
  expiresIn: 300,
  maxAttempts: 5, // Invalidate OTP after 5 failed attempts
  // ...
}),
```

**Pros:** Closes brute-force window; OTP invalidated after 5 failures
**Cons:** Verify the exact Better Auth emailOTP `maxAttempts` option name/behavior
**Effort:** Small
**Risk:** Low

## Acceptance Criteria

- [ ] OTP verification endpoint has a custom rate limit rule
- [ ] `maxAttempts` is configured in the emailOTP plugin (if supported by Better Auth)
- [ ] After N failed verification attempts, the OTP is invalidated
- [ ] Rate limit path matches the actual Better Auth endpoint path

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-06 | Created from PR #104 multi-agent review (security sentinel) | 6-digit OTP with global 10/60s rate limit allows ~50 guesses per OTP lifetime |
