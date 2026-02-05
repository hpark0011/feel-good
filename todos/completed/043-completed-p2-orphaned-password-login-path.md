---
status: completed
priority: p2
issue_id: "043"
tags: [code-review, pr-103, auth, ux, product]
dependencies: []
---

# Clarify Password Login Path for Existing Users

## Problem Statement

LoginBlock now only shows magic link + OAuth. Existing users who registered with email/password have no visible way to sign in with their password from the login page.

## Findings

**Source:** PR #103 code review (multi-agent)

**Affected Files:**
- `packages/features/auth/blocks/login-block.tsx`
- `packages/features/auth/views/password-login-view.tsx` (still exists but not rendered)

**Details:**
- `LoginBlock` removed password form and forgot-password link
- `password-login-view.tsx` and `use-password-sign-in.ts` still exist in the codebase
- Users who registered with password before this change may be confused
- Magic link may work as a fallback if Better Auth supports it for password accounts

## Proposed Solutions

### Option A: Verify magic link works for password-registered accounts
- **Pros:** No UI changes needed if it works
- **Cons:** Users may not realize they can use magic link
- **Effort:** Small (testing)
- **Risk:** Low

### Option B: Add a "Sign in with password" toggle/link
- **Pros:** Explicit path for existing users
- **Cons:** More UI complexity
- **Effort:** Medium
- **Risk:** Low

### Option C: Intentional product decision — document it
- **Pros:** Clarity for team
- **Cons:** May frustrate existing users
- **Effort:** Trivial
- **Risk:** Medium (UX)

## Recommended Action

Verify that magic link works for existing password-registered accounts. If so, document the product decision. If not, add a password login option.

## Acceptance Criteria

- [ ] Confirmed whether magic link works for password-registered accounts
- [ ] Product decision documented
- [ ] No users locked out of their accounts

## Work Log

| Date | Action | Outcome |
|------|--------|---------|
| 2026-02-05 | Created from PR #103 review | Pending |
