---
status: pending
priority: p3
issue_id: "053"
tags: [code-review, pr-103, auth, ux]
dependencies: []
---

# Standardize Email Placeholder Across Auth Views

## Problem Statement

Auth views use two different email placeholders: `you@example.com` (magic link, forgot password) and `m@example.com` (password views).

## Findings

**Source:** PR #103 pattern recognition review

**Affected Files:**
- `packages/features/auth/views/magic-link-login-view.tsx` — `you@example.com`
- `packages/features/auth/views/magic-link-sign-up-view.tsx` — `you@example.com`
- `packages/features/auth/views/forgot-password-view.tsx` — `you@example.com`
- `packages/features/auth/views/password-login-view.tsx` — `m@example.com`
- `packages/features/auth/views/password-sign-up-view.tsx` — `m@example.com`

## Proposed Solutions

### Option A: Standardize on you@example.com (Recommended)
- **Pros:** More descriptive, consistent
- **Cons:** None
- **Effort:** Trivial
- **Risk:** None

## Acceptance Criteria

- [ ] All auth email inputs use the same placeholder

## Work Log

| Date | Action | Outcome |
|------|--------|---------|
| 2026-02-05 | Created from PR #103 pattern recognition review | Pending |
