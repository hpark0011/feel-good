# Closed-Beta Email Allowlist for Mirror Signup — Spec

## Overview

Gate all new Mirror user creation on a server-side email allowlist stored in Convex. During the closed beta, only emails present in the `betaAllowlist` table may register; unlisted emails see a friendly "invite-only" error before any OTP is sent. Existing users and all in-beta users are unaffected when signing in. v1 ships with no admin UI — rows are added via the Convex dashboard using internal mutations.

## User Stories

**US-1: Unlisted email gets a clear "invite-only" message**
As someone who hears about Mirror and tries to sign up, when I enter my email on the sign-up page and my email isn't on the beta list, I want to see a friendly message saying "Sign-ups are currently invite-only. Contact us if you'd like access." *before* any verification code is sent, so I understand why I can't proceed and who to contact — instead of waiting for an email that never arrives.

**US-2: Invited beta user completes signup normally**
As a beta tester whose email was added to the allowlist, when I visit the sign-up page and enter my email, I want the flow to proceed exactly like a normal OTP signup — I receive a verification code, enter it, and land in Mirror — so being in the beta feels like a first-class experience, not a workaround.

**US-3: Existing user signs in without being blocked**
As an already-registered Mirror user, when I go to log in — even if my email was never explicitly added to the allowlist — I want to request an OTP and sign in without hitting any "invite-only" message, so the closed beta doesn't accidentally lock me out of my own account.

**US-4: Unlisted user can't sneak in via "sign in" instead of "sign up"**
As a curious visitor trying to bypass the gate by clicking "Log in" instead of "Sign up" and entering a brand-new email, I want the system to treat my request the same way — invite-only message, no code sent — so there's no back door that silently creates accounts for unlisted emails.

**US-5: Unlisted user can't sneak in via Google**
As a visitor who clicks "Continue with Google" with a non-allowlisted Google account, I want the signup to fail cleanly instead of quietly creating an account, so the closed beta actually stays closed across every signup path — not just email OTP. *(v1 caveat: the Google error screen will be generic, not the polished "invite-only" copy — a follow-up ticket will make the message match.)*

**US-6: Error message doesn't leak who's registered**
As any visitor entering an email, I want the "invite-only" message to look the same whether the email is unknown or already belongs to a registered user I'm not supposed to know about, so the signup form can't be used to probe who has a Mirror account.

**US-7: Beta admin adds someone to the list without a deploy**
As the person running the closed beta, when a new tester should be granted access, I want to add their email through the Convex dashboard (no code change, no redeploy) and have them be able to sign up within seconds, so onboarding new testers is a 10-second task instead of a release cycle.

## Tests (written before Requirements, on purpose)

Tests live before the FR/NFR tables deliberately: each user story is translated into a concrete, failing-until-built test here, and the Requirements section downstream exists to make those tests pass. An FR without a test below is a wish — delete it or add a test. An FR whose test only checks "component renders" is drift — rewrite the test against the user story.

### Playwright E2E Tests (user-flow first, per `.claude/rules/testing.md`)

All scenarios live in `apps/mirror/e2e/beta-allowlist.spec.ts` unless noted. Run via `pnpm --filter=@feel-good/mirror test:e2e -- beta-allowlist`.

| Scenario | User flow (what the user actually sees) | Verifies |
| --- | --- | --- |
| **Blocked signup — unlisted email** | Visit `/sign-up`. Enter an email that is not on the allowlist and not a Playwright test email. Click submit. Within one request, the form shows `FormError` with the copy "Sign-ups are currently invite-only. Contact us if you'd like access." The user does NOT advance to the OTP-entry step. Assert `testOtpStore` has no row for that email. | US-1 |
| **Allowlisted signup — happy path** | Seed an allowlist row via `internal.betaAllowlist.mutations.addAllowlistEntry`. Visit `/sign-up`. Enter the seeded email. Click submit. The form advances to the OTP-entry step. Read the OTP from `testOtpStore`, enter it, submit. User lands on the authenticated Mirror destination. | US-2, US-7 |
| **Existing off-allowlist user signs in cleanly** | Seed a Better Auth user directly via `authComponent.adapter.create` with an email that is NOT on the allowlist. Visit `/login`. Enter that email. Click submit. The form advances to the OTP-entry step with no `BETA_CLOSED` error shown. Read OTP, verify, confirm the user reaches their authenticated session. | US-3 |
| **Attacker tries sign-in route with a brand-new unlisted email** | Visit `/login` (the sign-in form, not `/sign-up`). Enter a brand-new email that is not on the allowlist and has no Better Auth user. Click submit. The form shows the same `BETA_CLOSED` copy as the blocked-signup case. `testOtpStore` has no row for that email. | US-4 |
| **Google OAuth blocked for unlisted email** | Stub the Google OAuth exchange to return a non-allowlisted test email. Complete the OAuth callback. The user does NOT end up in an authenticated Mirror session. Assert via an internal query that neither the Better Auth component's user table nor the app `users` table contains a row for that email. *(v1 UX caveat: the error screen is Better Auth's generic callback error, not the polished BETA_CLOSED copy — see Open Question #1. Security behavior is the test target, not the copy.)* | US-5 |
| **Rejection message does not leak user existence** | Submit three inputs through the sign-up form: (a) unlisted unknown email, (b) unlisted email that corresponds to an existing Better Auth user (seeded before the test), and (c) a completely made-up email. Case (b) advances to OTP entry. Cases (a) and (c) show the identical `BETA_CLOSED` copy. The network response shapes for (a) and (c) are byte-identical (same status, same error `code`, same `message`). | US-6 |
| **Existing auth suite regression check** — `apps/mirror/e2e/auth.spec.ts` | The pre-existing auth flows continue to pass unchanged (Playwright test emails still bypass the allowlist gate at both tiers). | FR-11 |

### Unit Tests (Vitest)

Run via `pnpm --filter=@feel-good/convex test -- betaAllowlist` and `pnpm --filter=@feel-good/features test`.

| Test File | Test Case | Verifies |
| --- | --- | --- |
| `packages/convex/convex/betaAllowlist/__tests__/allowlist.test.ts` | `addAllowlistEntry` inserts exactly one row; re-inserting the same email is idempotent | US-7 |
| `packages/convex/convex/betaAllowlist/__tests__/allowlist.test.ts` | `isEmailAllowed` matches case-insensitively: stored `"foo@bar.com"`, query `"Foo@BAR.com"` → `true` | US-2, US-7 |
| `packages/convex/convex/betaAllowlist/__tests__/allowlist.test.ts` | `isEmailAllowed` returns `false` for an unknown email | US-1 |
| `packages/convex/convex/betaAllowlist/__tests__/allowlist.test.ts` | `removeAllowlistEntry` deletes the row; subsequent `isEmailAllowed` → `false` | US-7 |
| `packages/convex/convex/betaAllowlist/__tests__/trigger.test.ts` | Invoking `authComponent`'s `adapter.create` mutation with an off-allowlist email throws; afterwards both the component user table (queried via `components.betterAuth.adapter.findOne`) and the app `users` table contain zero rows for that email (verifies atomic rollback on all provider paths) | US-5 |
| `packages/convex/convex/betaAllowlist/__tests__/trigger.test.ts` | Invoking `adapter.create` with an allowlisted email succeeds and inserts one row into the app `users` table | US-2 |
| `packages/convex/convex/betaAllowlist/__tests__/send-otp.test.ts` | `sendVerificationOTP` callback with an unlisted unknown email throws `APIError` whose `body.code === "BETA_CLOSED"` (explicit, not auto-derived from message) | US-1, US-4 |
| `packages/convex/convex/betaAllowlist/__tests__/send-otp.test.ts` | `sendVerificationOTP` callback with an existing Better Auth user (off-allowlist) passes through and invokes the inner `sendOTP` action | US-3 |
| `packages/convex/convex/betaAllowlist/__tests__/send-otp.test.ts` | Query count: existing-user case issues exactly 1 `findOne`; unlisted-unknown case issues 1 `findOne` + 1 `isEmailAllowed`; allowlisted-unknown case issues 1 `findOne` + 1 `isEmailAllowed` | NFR-01 |
| `packages/convex/convex/betaAllowlist/__tests__/send-otp.test.ts` | Three rejection inputs (unlisted+unknown, allowlisted+unknown, unlisted+existing) each produce exactly the expected outcome; the only error branch throws `APIError` with `code === "BETA_CLOSED"` and identical message | US-6 |
| `packages/features/auth/__tests__/auth-error-messages.test.ts` | `getAuthErrorMessage("BETA_CLOSED")` returns "Sign-ups are currently invite-only. Contact us if you'd like access." | US-1 |

> Note: `packages/features/auth/__tests__/auth-error-messages.test.ts` is a new file and requires adding a `test` script to `packages/features/package.json` (`"test": "vitest run"`) plus a minimal `vitest.config.ts`. This is part of Step 3.

## Requirements

### Functional Requirements

| ID    | Requirement                                                                                                                                                                                                                                                  | Priority | Verification                                                                                                                                                                |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-01 | A new Convex table `betaAllowlist` exists with fields `{ email: string, note?: string, addedAt: number }` and a `by_email` index.                                                                                                                            | p0       | `pnpm exec convex codegen` succeeds; `packages/convex/convex/_generated/dataModel.d.ts` contains `betaAllowlist`; Vitest `isEmailAllowed.test.ts` writes + reads the table. |
| FR-02 | `isEmailAllowed(ctx, { email })` internalQuery returns `true` iff a row exists whose `email` matches the input case-insensitively (both sides lowercased at write and query time).                                                                           | p0       | Vitest: `isEmailAllowed` returns `true` for `"Foo@Bar.com"` when row stored as `"foo@bar.com"`, `false` otherwise.                                                          |
| FR-03 | `addAllowlistEntry(email, note?)` internalMutation inserts a row with `email` lowercased and `addedAt = Date.now()`. Idempotent: inserting an already-listed email is a no-op.                                                                               | p0       | Vitest: calling twice with same email results in exactly one row; `email` stored lowercase.                                                                                 |
| FR-04 | `removeAllowlistEntry(email)` internalMutation deletes the row by case-insensitive lookup. No-op if not present.                                                                                                                                             | p1       | Vitest: insert → remove → query returns empty.                                                                                                                              |
| FR-05 | **Authoritative gate** — the Convex `authComponent` `user.onCreate` trigger throws when `doc.email` is not on the allowlist. Per verified Better Auth + `@convex-dev/better-auth` source (`better-auth/dist/db/with-hooks.mjs`, `@convex-dev/better-auth/src/client/create-api.ts`), the trigger runs inside the same Convex mutation as the component user insert, so the throw atomically rolls back the component's user row. This gate covers **every** user-creation path — email-OTP verify, Google OAuth first-time sign-in, and any future provider — because all of them go through `createWithHooks → adapter.create` which dispatches `onCreateHandle`. | p0 | Vitest: simulate a Better Auth user insert with an off-allowlist email through the Convex component's `adapter.create` mutation → expect throw; assert `ctx.runQuery(components.betterAuth.adapter.findOne, { model: "user", where: [{ field: "email", value: email }] })` returns `null` AND app `users` table is empty. Playwright: blocked Google OAuth flow produces no app `users` row for the test Google account. |
| FR-06 | **Early-rejection UX gate (email-OTP path only)** — `sendVerificationOTP` in `createAuth()` rejects unlisted emails before an OTP email is dispatched, by throwing `new APIError("FORBIDDEN", { code: "BETA_CLOSED", message: <FR-10 copy> })` (import from `better-auth/api`). The gate passes through when the email is already a Better Auth user (checked via `ctx.runQuery(components.betterAuth.adapter.findOne, { model: "user", where: [{ field: "email", value: email.toLowerCase() }] })`). The client `handleAuthError` in `use-otp-auth.ts:72-85` maps `ctx.error.code === "BETA_CLOSED"` → `getAuthErrorMessage("BETA_CLOSED")` → `FormError`. | p0 | Playwright: unlisted email submitted via `/sign-up` form → `FormError` shows the BETA_CLOSED copy within one request; `testOtpStore` has no row for that email. Vitest: calling the `sendVerificationOTP` callback with an unlisted email throws `APIError` with `body.code === "BETA_CLOSED"`. |
| FR-07 | **Signup form `type` correction** — `packages/features/auth/components/forms/otp-sign-up-form.tsx:48` must pass `type: "sign-in"` to `useOTPAuth` instead of `"email-verification"`. Rationale: per verified `better-auth/dist/plugins/email-otp/routes.mjs:58-91`, the `/email-otp/send-verification-otp` route only invokes the `sendVerificationOTP` callback for unknown emails when `type === "sign-in"` and `disableSignUp` is false; for `type === "email-verification"` on an unknown email it silently short-circuits before the callback, which would let an unlisted user hit the "enter OTP" screen and wait for an email that never arrives. `type: "sign-in"` is also the semantically correct value for Better Auth's sign-in-or-signup-via-OTP mode. | p0 | `grep -n 'type: "sign-in"' packages/features/auth/components/forms/otp-sign-up-form.tsx` returns a match at the `useOTPAuth` call site; pre-existing `apps/mirror/e2e/auth.spec.ts` still passes. |
| FR-08 | Existing Mirror users (present in the Better Auth component's user table) can still request an OTP and sign in even if their email is NOT on the allowlist. | p0 | Playwright: seed an existing user via `authComponent.adapter.create` (off-allowlist email), submit that email through the `/login` form → step advances to verify; no BETA_CLOSED error shown. |
| FR-09 | Allowlisted emails can complete the full OTP signup flow: request OTP → receive OTP via `testOtpStore` → verify → land on authenticated Mirror destination. | p0 | Playwright: seed allowlist row via `internal.betaAllowlist.mutations.addAllowlistEntry`, submit email through `/sign-up`, capture OTP from `testOtpStore`, verify, assert redirect to authenticated destination. |
| FR-10 | A `BETA_CLOSED` entry exists in `AUTH_ERROR_MESSAGES` with copy: "Sign-ups are currently invite-only. Contact us if you'd like access." `getAuthErrorMessage("BETA_CLOSED")` returns that string. The `code` field must be passed **explicitly** when constructing the `APIError` — per verified `better-call/dist/error.mjs:97-113`, Better Auth derives `code` from `message` otherwise, producing unstable snake-cased strings. | p0 | Vitest unit test on `packages/features/auth/types.ts`; grep confirms `new APIError(` call sites in `packages/convex/convex/auth/client.ts` always pass an explicit `code:` field. |
| FR-11 | Playwright test emails (as determined by `isPlaywrightTestEmail`) remain exempt from allowlist enforcement in both the `sendVerificationOTP` gate and the `user.onCreate` trigger, so existing auth e2e suites keep passing without seeding the allowlist for every test email. | p0 | `pnpm --filter=@feel-good/mirror test:e2e -- auth` passes the pre-existing suite unchanged. |

### Non-functional Requirements

| ID     | Requirement                                                                                                                                                                                | Priority | Verification                                                                                                       |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------------------------------ |
| NFR-01 | The `sendVerificationOTP` request-time gate uses at most two `components.betterAuth.adapter.findOne` / `isEmailAllowed` round-trips. Existing-user check runs first and short-circuits to skip the allowlist check for the common sign-in case. | p1 | Vitest: instrument or spy on `runQuery` — existing-user case makes exactly 1 query, unlisted-unknown case makes exactly 2 queries. |
| NFR-02 | Rejection message must not leak whether an email *is on the allowlist* vs *is already a user* — both non-allowlisted unknown emails see `BETA_CLOSED`; known users bypass silently with no error. | p2 | Vitest: three inputs (unlisted+unknown, allowlisted+unknown, unlisted+existing) each return exactly the expected outcome; the only error branch in `sendVerificationOTP` produces `APIError` with `code === "BETA_CLOSED"`. |
| NFR-03 | Schema, query, and mutation files for `betaAllowlist` live under `packages/convex/convex/betaAllowlist/` following the co-located pattern already used by `users/` and `chat/`.            | p2       | `ls packages/convex/convex/betaAllowlist/{schema.ts,queries.ts,mutations.ts}` exits 0; root `schema.ts` import resolves during `pnpm --filter=@feel-good/convex run generate`. |
| NFR-04 | The Playwright test-email bypass in `sendVerificationOTP` is a no-op in production: `isPlaywrightTestMode()` must only return true when the explicit `PLAYWRIGHT_TEST_MODE` env var is set (not derivable from `NODE_ENV` alone). No production deployment may have this env var set. | p0       | `grep` confirms `isPlaywrightTestMode` reads `process.env.PLAYWRIGHT_TEST_MODE` (already true per `packages/convex/convex/auth/testMode.ts`); vitest asserts the function returns `false` when the env var is unset even if `NODE_ENV=production`; deploy runbook / env audit confirms prod Convex deployment has no `PLAYWRIGHT_TEST_MODE` value. |

## Architecture

### Two-tier enforcement model

All verified claims below are grounded in either `node_modules/@convex-dev/better-auth/src/` or `node_modules/better-auth/dist/` from the installed versions in this worktree. No speculative language remains.

1. **Tier 1 — Authoritative gate: `triggers.user.onCreate` (FR-05).** This is the only gate that is security-critical. Better Auth's `createWithHooks` (`better-auth/dist/db/with-hooks.mjs:6-31`) calls `adapter.create` for every user-creation path (email-OTP verify, Google OAuth first-time sign-in, any future provider). The Convex adapter's `create` dispatches `onCreateHandle` via `ctx.runMutation` (`@convex-dev/better-auth/src/client/adapter.ts:166-181`, `src/client/create-api.ts:66-106`), which invokes the inline `triggers.user.onCreate` callback at `src/client/create-client.ts:304-313`. The callback runs in the same atomic Convex mutation as the component user insert — an uncaught throw propagates back out, aborts the mutation, and rolls back the component user row along with any app-level writes. Our trigger queries `isEmailAllowed(doc.email.toLowerCase())` and throws `new Error("BETA_CLOSED: " + doc.email)` when unlisted. No existing-user check needed: `onCreate` only fires on genuinely new inserts.

2. **Tier 2 — Early-rejection UX gate: `sendVerificationOTP` (FR-06).** Better Auth's `/email-otp/send-verification-otp` route (`better-auth/dist/plugins/email-otp/routes.mjs:58-91`) invokes the plugin's `sendVerificationOTP` callback under two conditions: (a) the email already belongs to a Better Auth user, or (b) the email is unknown **and** `type === "sign-in"` **and** `disableSignUp` is false. For `type === "email-verification"` or `"forget-password"` on unknown emails the route short-circuits with `{ success: true }` before ever calling the callback — this is why FR-07 (changing the signup form's `type` to `"sign-in"`) is required for the UX gate to actually fire for new users.

   Inside the callback, we run `ctx.runQuery(components.betterAuth.adapter.findOne, { model: "user", where: [{ field: "email", value: email.toLowerCase() }] })` — verified as the correct API path per `@convex-dev/better-auth/src/client/create-api.ts` (the dedicated `getUserByEmail` helper does **not** exist in the package). If the query returns a user, pass through (existing-user sign-in). Else query `isEmailAllowed` → pass through if true, else `throw new APIError("FORBIDDEN", { code: "BETA_CLOSED", message: <FR-10 copy> })` from `better-auth/api`. Per verified `better-call/dist/error.mjs:97-113`, the explicit `code` field survives construction and reaches the client's `onError` handler as `ctx.error.code`, where `use-otp-auth.ts:72-85` maps it through `getAuthErrorMessage` → `FormError`.

3. **Google OAuth (no Tier 2).** Google OAuth has no `sendVerificationOTP` equivalent in our code path. Rejection happens exclusively at Tier 1, which means the end user sees Better Auth's generic OAuth error response rather than our BETA_CLOSED copy. See Open Question #1.

### Known minor wart (documented, accepted for v1)

Per `better-auth/dist/plugins/email-otp/routes.mjs:65-81`, Better Auth stores the generated OTP in its `verification` table **before** invoking `sendVerificationOTP`. If our Tier 2 gate throws, that verification row is not cleaned up by Better Auth (only the "user-not-found + not sign-in" short-circuit branch deletes it). The row is harmless — it cannot be consumed without the matching OTP being delivered, and expires per the plugin's `expiresIn: 300` seconds — but it's a minor data-integrity wart worth knowing.

### Files to create

| File                                                           | Purpose                                                                                            |
| -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `packages/convex/convex/betaAllowlist/schema.ts`                | `betaAllowlistTable` definition with `by_email` index.                                              |
| `packages/convex/convex/betaAllowlist/queries.ts`               | `isEmailAllowed` internalQuery (case-insensitive; takes lowercased email). Does NOT include a user-existence helper — that's a direct call to `components.betterAuth.adapter.findOne` from the `sendVerificationOTP` callback, not a wrapper. |
| `packages/convex/convex/betaAllowlist/mutations.ts`             | `addAllowlistEntry` + `removeAllowlistEntry` internalMutations for dashboard use.                   |
| `packages/convex/convex/betaAllowlist/__tests__/allowlist.test.ts` | Vitest unit tests for queries + mutations + case-insensitivity.                                 |
| `packages/convex/convex/betaAllowlist/__tests__/trigger.test.ts`   | Vitest test verifying `onCreate` safety-net throws on unlisted emails.                           |
| `apps/mirror/e2e/beta-allowlist.spec.ts`                         | Playwright flows FR-05, FR-06, FR-07.                                                              |

### Files to modify

| File                                                         | Change                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/convex/convex/schema.ts`                           | Import `betaAllowlistTable`, add to `defineSchema({ ... betaAllowlist: betaAllowlistTable })`.                                                                                                                                                                                                                                                                          |
| `packages/convex/convex/auth/client.ts`                      | (1) Inside `sendVerificationOTP` (lines 125-144), after the Playwright test-mode bypass, run `const existing = await actionCtx.runQuery(components.betterAuth.adapter.findOne, { model: "user", where: [{ field: "email", value: email.toLowerCase() }] })`. If `existing` is truthy, fall through to the existing `sendOTP` action call. Else `const allowed = await actionCtx.runQuery(internal.betaAllowlist.queries.isEmailAllowed, { email: email.toLowerCase() })`. If `allowed`, fall through. Else `throw new APIError("FORBIDDEN", { code: "BETA_CLOSED", message: "Sign-ups are currently invite-only. Contact us if you'd like access." })` (import `APIError` from `better-auth/api`, import `components` from `../_generated/api`). (2) Inside the inline `triggers.user.onCreate` callback (lines 20-26), before `ctx.db.insert("users", ...)`, run `const allowed = await ctx.runQuery(internal.betaAllowlist.queries.isEmailAllowed, { email: doc.email.toLowerCase() })` and `throw new Error("BETA_CLOSED: " + doc.email)` if not allowed (also guard with `isPlaywrightTestEmail(doc.email)` bypass). This is the authoritative gate. |
| `packages/features/auth/components/forms/otp-sign-up-form.tsx` | Line 48: change `type: "email-verification"` → `type: "sign-in"`. See FR-07 for rationale. |
| `packages/features/auth/types.ts`                            | Add `BETA_CLOSED: "Sign-ups are currently invite-only. Contact us if you'd like access."` to `AUTH_ERROR_MESSAGES` (line 29 block). |

### Dependencies to add

None. `APIError` already ships with `better-auth`.

## Anti-patterns to Avoid

- **Do not use `type: "email-verification"` on the sign-up form.** Per `better-auth/dist/plugins/email-otp/routes.mjs:82`, Better Auth short-circuits `/email-otp/send-verification-otp` for unknown emails with that type and never invokes the `sendVerificationOTP` callback — unlisted users would hit the "enter OTP" screen and wait for an email that never arrives. Use `type: "sign-in"` for the OTP-based sign-in-or-signup flow (FR-07).
- **Do not treat the `sendVerificationOTP` gate as security-critical.** It's Tier 2 UX-only. The authoritative gate is the Convex `user.onCreate` trigger (Tier 1). Removing or bypassing Tier 2 is only a UX regression; removing Tier 1 is a security hole.
- **Do not use the app `users` table as the source of truth for "user exists".** An orphaned Better Auth user from a previously aborted insert would be invisible there and the legitimate user would be silently blocked. Query `components.betterAuth.adapter.findOne` against `model: "user"` with a lowercased email.
- **Do not invent a `components.betterAuth.getUserByEmail` call.** That helper does not exist in `@convex-dev/better-auth`. The supported path is `components.betterAuth.adapter.findOne` with a `where` clause.
- **Do not omit the `code` field when constructing `APIError`.** Per `better-call/dist/error.mjs:97-113`, Better Auth auto-derives `code` from the message string if omitted, producing unstable snake-cased values. Always pass `code: "BETA_CLOSED"` explicitly.
- **Do not use Better Auth `databaseHooks.user.create.before`.** That callback runs under Better Auth's own AsyncLocalStorage-based context (`better-auth/dist/db/with-hooks.mjs:6-19`) and has no access to the Convex `actionCtx` closure. Use the Convex `authComponent` `triggers.user.onCreate` instead — it runs inside the component mutation with full `ctx` access.
- **Do not leak which branch rejected the email** (allowlist miss vs unknown state). Both non-listed-non-existing emails return the same `BETA_CLOSED` code.
- **Do not expose `addAllowlistEntry` / `removeAllowlistEntry` as public mutations.** They must be `internalMutation` only; v1 admin access is via Convex dashboard Run Function.
- **Do not store emails mixed-case.** Lowercase on write and on query or the index will miss. Follow the pattern already used elsewhere.
- **Do not bypass the safety-net trigger with a TODO.** The Google OAuth path exists today and will silently admit anyone with a Google account if the trigger isn't hardened.
- **Do not add a `setTimeout` or retry around the allowlist query "in case it's slow".** It's an indexed point lookup; failures should surface as errors.
- **Do not widen the Playwright test-email bypass.** `isPlaywrightTestMode()` must remain gated on the explicit `PLAYWRIGHT_TEST_MODE` env var. Never degrade this to a `NODE_ENV !== "production"` check — Convex cloud dev can report `NODE_ENV=production`, and a guessable predicate would be a production backdoor (see NFR-04).

## Team Orchestration Plan

Reviewer selection and wave packaging happen at execution time — see `.claude/skills/orchestrate-implementation/SKILL.md`.

```
Step 1 — Convex schema + allowlist module
Suggested executor: general
Scope: create packages/convex/convex/betaAllowlist/{schema.ts,queries.ts,mutations.ts}; register
       betaAllowlistTable in packages/convex/convex/schema.ts. queries.ts exports only
       isEmailAllowed (internalQuery). The user-existence check is NOT a wrapper — it's a direct
       call to components.betterAuth.adapter.findOne from auth/client.ts at Step 2 time.
Hard gate:
  pnpm --filter=@feel-good/convex run generate
  pnpm --filter=@feel-good/convex test -- betaAllowlist
Verifies: FR-01, FR-02, FR-03, FR-04
```

```
Step 2 — Wire Tier 1 trigger + Tier 2 sendVerificationOTP gate + signup form type
Suggested executor: chat-backend-developer  (owns Convex auth surface per .claude/agents/chat-backend-developer.md)
Scope:
  (a) packages/convex/convex/auth/client.ts — edit the inline triggers.user.onCreate callback
      (lines 20-26): before ctx.db.insert("users", ...), call
      await ctx.runQuery(internal.betaAllowlist.queries.isEmailAllowed, { email: doc.email.toLowerCase() })
      (also bypass for isPlaywrightTestEmail(doc.email)). Throw Error("BETA_CLOSED: " + doc.email)
      if not allowed. Tier 1, authoritative.
  (b) packages/convex/convex/auth/client.ts — edit sendVerificationOTP (lines 125-144). After the
      Playwright test-mode bypass, await the existence check via
      ctx.runQuery(components.betterAuth.adapter.findOne, { model: "user", where: [{ field: "email", value: email.toLowerCase() }] }).
      If truthy, fall through. Else await isEmailAllowed; if true fall through; else
      throw new APIError("FORBIDDEN", { code: "BETA_CLOSED", message: <FR-10 copy> }).
      Import APIError from "better-auth/api". Import components from "../_generated/api".
  (c) packages/features/auth/components/forms/otp-sign-up-form.tsx line 48 — change
      type: "email-verification" → type: "sign-in" (FR-07).
  Do NOT alter isPlaywrightTestMode or testMode.ts.
Hard gate:
  pnpm --filter=@feel-good/convex run generate
  pnpm --filter=@feel-good/mirror build
  pnpm --filter=@feel-good/convex test -- betaAllowlist
  grep -n 'type: "sign-in"' packages/features/auth/components/forms/otp-sign-up-form.tsx
  grep -n 'code: "BETA_CLOSED"' packages/convex/convex/auth/client.ts
Verifies: FR-05, FR-06, FR-07, FR-08, FR-10, NFR-01, NFR-02, NFR-03, NFR-04
```

```
Step 3 — Error surface in auth package
Suggested executor: general
Scope: packages/features/auth/types.ts — add BETA_CLOSED entry. Add packages/features/package.json
       "test" script + minimal vitest.config.ts if missing. Write packages/features/auth/__tests__/
       auth-error-messages.test.ts.
Hard gate:
  pnpm --filter=@feel-good/features test
  pnpm --filter=@feel-good/mirror build
Verifies: FR-09
```

```
Step 4 — Playwright e2e coverage
Suggested executor: playwright-browser-agent
Scope: apps/mirror/e2e/beta-allowlist.spec.ts — three scenarios from the E2E table. Use the
       existing Playwright-mode OTP capture pattern (isPlaywrightTestMode + testOtpStore). Seed
       the allowlist via the internal addAllowlistEntry mutation invoked over the test harness's
       Convex client (mirror existing auth.spec.ts patterns).
Hard gate:
  pnpm --filter=@feel-good/mirror test:e2e -- beta-allowlist
  pnpm --filter=@feel-good/mirror test:e2e -- auth
Verifies: FR-05, FR-06, FR-07, FR-10
```

```
Step 5 — Full verification
Suggested executor: general
Scope: re-run full build + lint + tests across affected packages; no code changes unless a
       regression is found.
Hard gate:
  pnpm --filter=@feel-good/mirror build
  pnpm --filter=@feel-good/mirror lint
  pnpm --filter=@feel-good/convex test
  pnpm --filter=@feel-good/mirror test:e2e
Verifies: all FR + NFR
```

## Open Questions

1. **Google OAuth failure UX.** Tier 1 trigger throw on an unlisted Google OAuth user rolls back the component user row (verified), but Better Auth surfaces the underlying error through the OAuth callback as a generic error response, not our `BETA_CLOSED` copy. Worst case: user sees a redirect loop or a blank error. **Decision required before shipping:** (a) accept v1 ugly UX and file a follow-up ticket to redirect `/sign-up?error=beta_closed` on OAuth error (low effort), or (b) build the redirect as part of this spec. Recommendation: (a), with the follow-up ticket filed and linked before merge.
2. **Seeding initial allowlist.** How is the first batch of beta emails loaded? Options: (a) manual dashboard entries, (b) a one-off internal mutation that takes an array. Recommend (a) for v1 — simplest, no code.
3. **OTP verify-time re-check.** Known limitation: if an admin removes an email from the allowlist in the ~5-minute window between OTP send and OTP verify (Tier 2 window only, not Tier 1), the verify still succeeds at Tier 2 — but Tier 1 will then catch it on user insert and roll back. Net effect: the user sees a generic error at the verify step rather than the polished BETA_CLOSED copy. Small window, admin-initiated. **Accepted as a known race for v1.**

## Adversarial Review Summary

Stop reason: **quality bar met** after one critique round + one verification round + one grounding pass against `node_modules/@convex-dev/better-auth/` and `node_modules/better-auth/`.

| Concern | Severity | Resolution |
| --- | --- | --- |
| Trigger rollback semantics unverified | Critical | **Resolved by source verification** — `@convex-dev/better-auth/src/client/create-api.ts:66-106` and `src/client/create-client.ts:304-313` show the trigger runs inside `ctx.runMutation` of the component's `create` mutation, with no try/catch. An uncaught throw aborts the enclosing mutation and rolls back the component user row atomically. Hedging language removed from FR-05. |
| Client-supplied `type: "sign-in"` implicit-signup bypass | Critical | **Resolved differently than original fix** — source verification of `better-auth/dist/plugins/email-otp/routes.mjs:58-91` shows that for `type: "sign-in"` on an unknown email with default `disableSignUp: false`, `sendVerificationOTP` IS invoked. Tier 1 (trigger) is the authoritative gate regardless; Tier 2 (sendVerificationOTP) covers the `type: "sign-in"` implicit-signup path as a UX early-rejection. FR-06/FR-07 make this explicit. |
| Tier 2 dead code for `type: "email-verification"` | Critical (newly discovered during source verification) | **Accepted** — same source file shows that `type: "email-verification"` on unknown emails short-circuits before `sendVerificationOTP` is called. The Mirror sign-up form currently sends that value (`otp-sign-up-form.tsx:48`). FR-07 requires changing it to `"sign-in"`. Tier 1 would still catch unlisted users at verify time, but UX would be unacceptable (user waits for an OTP that never comes). |
| Race: allowlist row removed between OTP send and verify | Important | **Accepted as known limitation** — Tier 1 still catches it on insert and rolls back, so security is intact; only the error presentation degrades from BETA_CLOSED to generic. Documented in Open Questions #3. |
| `isPlaywrightTestEmail` bypass is a production backdoor if predicate is guessable | Important | **Accepted** — NFR-04 requires the bypass to be gated on explicit `PLAYWRIGHT_TEST_MODE` env var (confirmed at `packages/convex/convex/auth/testMode.ts`) and adds a deploy-time audit. |
| `isExistingUser` source of truth deferred | Important | **Resolved by source verification** — `@convex-dev/better-auth` does NOT expose a `getUserByEmail` helper. The correct API is `ctx.runQuery(components.betterAuth.adapter.findOne, { model: "user", where: [{ field: "email", value: lowercasedEmail }] })`. Codified in Architecture, FR-06, and Step 2 scope. Step 0 prerequisite dropped. |
| Google OAuth failure UX worse than described | Minor | **Partially accepted** — Open Question #1 sharpened with a decision point and a concrete follow-up ticket requirement before merge. Tier 1 still blocks the user creation authoritatively; only the presentation suffers. |
| Verification: every orchestration step must name a `Critique:` agent | Minor | **Rejected** — contradicts the spec-template rule: reviewer selection is explicitly owned by `orchestrate-implementation`, not the spec. Keeping the `code-review-*` roster out of the spec prevents drift. |
| Verification: NFR-01/NFR-02 use subjective "code review" verification | Minor | **Accepted** — replaced with vitest query-count assertions and branch coverage. |
| Verification: `pnpm ... exec convex codegen` does not map to a package.json script | Minor | **Accepted** — all hard gates now use `pnpm --filter=@feel-good/convex run generate`. |
| Speculative `APIError` construction (`code` auto-derived?) | Minor (newly discovered during source verification) | **Accepted** — `better-call/dist/error.mjs:97-113` shows `code` is derived from `message` if omitted, producing unstable snake-cased values. FR-10 and anti-patterns now require passing `code: "BETA_CLOSED"` explicitly. |
