---
status: pending
priority: p3
issue_id: "046"
tags: [code-review, pr-103, auth, ux, copy]
dependencies: []
---

# Standardize Auth Button Labels

## Problem Statement

Auth view button labels were updated to "Continue with Email" but other views may use different patterns like "Sign in", "Sign up", or "Submit". The labeling should be consistent.

## Findings

**Source:** PR #103 code review (multi-agent)

**Affected Files:**
- `packages/features/auth/views/magic-link-login-view.tsx`
- `packages/features/auth/views/magic-link-sign-up-view.tsx`
- `packages/features/auth/views/password-login-view.tsx`
- `packages/features/auth/views/password-sign-up-view.tsx`

**Details:**
- Magic link views now use "Continue with Email"
- Password views may still use "Sign in" / "Sign up"
- Consistent verb choice improves UX

## Proposed Solutions

### Option A: Audit and standardize all auth CTA labels (Recommended)
- **Pros:** Consistent UX
- **Cons:** Subjective design decision
- **Effort:** Small
- **Risk:** None

## Acceptance Criteria

- [ ] All auth form CTAs follow a consistent label pattern
- [ ] Loading state labels are consistent (e.g., "Sending link..." vs "Signing in...")

## Work Log

| Date | Action | Outcome |
|------|--------|---------|
| 2026-02-05 | Created from PR #103 review | Pending |
