---
status: pending
priority: p2
issue_id: "077"
tags: [auth, otp, architecture, code-review]
dependencies: []
---

# Remove window.location.href from Shared Hook

## Problem Statement

`useOTPAuth.verifyOTP` performs `window.location.href = callbackURL` directly (line 113). This diverges from `useMagicLinkRequest` which delegates redirect to the auth client. A shared package hook should not own navigation behavior — it prevents consumers from doing soft navigation, showing success messages, or any post-auth logic before redirect.

Additionally, if `verifyOTP` succeeds after the component unmounts (user navigated away), the `window.location.href` fires and yanks the user to an unexpected page.

## Affected Files

- `packages/features/auth/hooks/use-otp-auth.ts` (lines 110-115)

## Proposed Solutions

### Option A: Delegate redirect to onSuccess callback (Recommended)

```typescript
onSuccess: () => {
  setStatus("success");
  onSuccess?.(); // let consumer handle redirect
},
```

The Mirror app's page component or a wrapper can handle `window.location.href` if needed.

**Pros:** Matches magic-link pattern, respects consumer autonomy
**Cons:** Mirror app needs to handle redirect in its onSuccess callback
**Effort:** Small
**Risk:** Low

## Acceptance Criteria

- [ ] `useOTPAuth` does not call `window.location.href`
- [ ] Consuming app (Mirror) handles redirect in its `onSuccess` callback
- [ ] Post-unmount verify no longer causes unexpected navigation

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-06 | Created from PR #104 multi-agent review (architecture, patterns, races) | Shared hooks should not own browser navigation |
