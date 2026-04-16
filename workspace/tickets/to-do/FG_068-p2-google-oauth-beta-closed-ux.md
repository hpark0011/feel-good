---
id: FG_068
title: "Google OAuth blocked signup shows polished invite-only copy"
date: 2026-04-16
type: improvement
status: to-do
priority: p2
description: "When an unlisted Google OAuth user hits the Tier 1 onCreate trigger, Better Auth surfaces a generic OAuth callback error instead of the polished BETA_CLOSED invite-only copy. Redirect to /sign-up?error=beta_closed on OAuth callback failure and render the same user-facing message."
dependencies: []
parent_plan_id: workspace/spec/closed-beta-email-allowlist-spec.md
acceptance_criteria:
  - "Unlisted Google OAuth user sees 'Sign-ups are currently invite-only. Contact us if you'd like access.' on the sign-up page after OAuth callback failure"
  - "Existing Google OAuth users (already in Better Auth user table) can still sign in via Google without seeing any error"
  - "pnpm --filter=@feel-good/mirror build exits 0"
  - "pnpm --filter=@feel-good/mirror lint produces 0 errors"
  - "grep -r 'beta_closed' apps/mirror/app/(auth) returns at least one match showing the error query param is handled"
owner_agent: "general-purpose"
---

# Google OAuth blocked signup shows polished invite-only copy

## Context

The closed-beta email allowlist (spec: `workspace/spec/closed-beta-email-allowlist-spec.md`) enforces signup restrictions at two tiers. Tier 1 (`triggers.user.onCreate` in `packages/convex/convex/auth/client.ts:63-76`) is the authoritative gate — it throws for unlisted emails inside the component mutation, atomically rolling back the user row. This works correctly for Google OAuth: the account is never created.

However, the Google OAuth path has no Tier 2 equivalent (there's no `sendVerificationOTP` callback for OAuth). When the Tier 1 trigger throws, Better Auth's OAuth callback handler surfaces the error as a generic redirect/error page rather than our polished BETA_CLOSED copy. The user sees a confusing error instead of "Sign-ups are currently invite-only. Contact us if you'd like access."

This was documented as Open Question #1 in the spec and accepted for v1 with a follow-up ticket requirement. Security is not affected — Tier 1 blocks the account creation regardless.

## Goal

After OAuth callback failure due to BETA_CLOSED, the user lands on `/sign-up?error=beta_closed` (or `/sign-in?error=beta_closed`) and sees the same invite-only copy rendered via `FormError`, matching the OTP flow experience.

## Scope

- Handle `error=beta_closed` query param on the sign-up and sign-in pages
- Render the BETA_CLOSED copy from `AUTH_ERROR_MESSAGES` when the query param is present
- Redirect the OAuth callback error to the appropriate auth page with the query param

## Out of Scope

- Changing the Tier 1 trigger logic (already working correctly)
- Adding a Tier 2 gate for Google OAuth (not feasible without Better Auth plugin changes)
- Custom error pages for other OAuth failure modes (network errors, consent denied, etc.)

## Approach

Intercept the Better Auth OAuth callback error and redirect to the sign-up page with a `?error=beta_closed` query param. On the sign-up/sign-in pages, read the query param and display the `AUTH_ERROR_MESSAGES.BETA_CLOSED` copy via `FormError`. The OAuth callback error detection may require inspecting Better Auth's `callbackURL` error handling or the `onError` callback in `OAuthButtons` (`packages/features/auth/components/shared/oauth-buttons.tsx:53-58`).

- **Effort:** Small
- **Risk:** Low

## Implementation Steps

1. Read Better Auth's OAuth callback error handling to understand how the error surfaces (check `node_modules/better-auth/dist/` OAuth routes and the callback redirect behavior)
2. In `packages/features/auth/components/shared/oauth-buttons.tsx`, update `handleGoogleSignIn` or the `onError` callback to detect BETA_CLOSED errors and redirect with `?error=beta_closed`
3. In the sign-up and sign-in page components (`apps/mirror/app/(auth)/sign-up/page.tsx`, `apps/mirror/app/(auth)/sign-in/page.tsx`), read `searchParams.error` and pass it to the auth block
4. In the auth blocks or form components, render `FormError` with the `AUTH_ERROR_MESSAGES.BETA_CLOSED` copy when the query param is present
5. Add a Playwright e2e test in `apps/mirror/e2e/beta-allowlist.spec.ts` that navigates to `/sign-up?error=beta_closed` and asserts the invite-only copy is visible

## Constraints

- Must use the same `AUTH_ERROR_MESSAGES.BETA_CLOSED` copy as the OTP flow (single source of truth in `packages/features/auth/types.ts`)
- Must not break existing Google OAuth sign-in for registered users
- Must not modify Tier 1 trigger logic in `packages/convex/convex/auth/client.ts`

## Resources

- Spec: `workspace/spec/closed-beta-email-allowlist-spec.md` (Open Question #1)
- OAuth buttons: `packages/features/auth/components/shared/oauth-buttons.tsx`
- Auth error messages: `packages/features/auth/types.ts`
- Tier 1 trigger: `packages/convex/convex/auth/client.ts:63-76`
