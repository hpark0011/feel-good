---
status: pending
priority: p3
issue_id: "049"
tags: [code-review, pr-103, auth, performance]
dependencies: ["023"]
---

# Supplement: Options Object Instability Still Present After PR #103

## Problem Statement

PR #103 does not address the `options` object instability in auth hooks' `useCallback` dependency arrays. This was previously tracked in #023 but remains unresolved. This PR's changes (removing password form from LoginBlock) reduce the surface area but the root cause persists in all 5 auth hooks.

## Findings

**Source:** PR #103 code review (multi-agent)

**Affected Files:**
- `packages/features/auth/hooks/use-password-sign-in.ts`
- `packages/features/auth/hooks/use-password-sign-up.ts`
- `packages/features/auth/hooks/use-magic-link-request.ts`
- `packages/features/auth/hooks/use-forgot-password.ts`
- `packages/features/auth/hooks/use-reset-password.ts`

**Details:**
- All hooks include `options` in `useCallback` dependency arrays
- `options` is an object passed as a prop, creating new references each render
- This defeats `memo()` wrappers on view components since handler refs change
- See todo #023 for the original tracking

## Recommended Action

Supplement to #023 — prioritize fixing since `memo()` on views is now standard.

## Work Log

| Date | Action | Outcome |
|------|--------|---------|
| 2026-02-05 | Created as supplement to #023 from PR #103 review | Pending |
