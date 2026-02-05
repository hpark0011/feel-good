# PR 103 Review Plan

- [x] Identify PR 103 diff vs main (files changed, scope)
- [x] Review auth view/component changes and deletions for regressions (magic link, password, OAuth)
- [x] Review app-level view changes (mirror, ui-factory, greyboard) for integration issues
- [x] Validate public exports/API changes for downstream breakage risks
- [x] Run relevant tests or typecheck/lint if feasible; otherwise note the gap
- [x] Document findings and add review section

## Review

### Findings
- P1: `LoginBlock` removed `forgotPasswordHref`, but `apps/mirror/app/(auth)/sign-in/page.tsx` still passes it, causing a TS error.
- P1: `apps/mirror/styles/fonts.css` was deleted, but `apps/mirror/styles/globals.css` still imports it.
- P2: `usePasswordSignUp` now hardcodes `name: ""` when calling `authClient.signUp.email`, which may break validation or create empty names without explanation.
- P2: `SignUpBlock` retains the `passwordForm` slot and `PasswordSignUpForm` import, but never renders it (slot is dead/inconsistent with LoginBlock).
- P2: `LoginBlock` no longer renders password login or forgot-password link; confirm this product change won’t strand password users.
- P3: Compatibility exports removed from `@feel-good/features/auth/components`; docs like root `CLAUDE.md`, `.claude/rules/monorepo.md`, and `apps/mirror/CLAUDE.md` still reference `SignInForm`/`SignUpForm`.

### Tests
- `pnpm lint --filter=@feel-good/mirror --filter=@feel-good/features` (failed: `apps/mirror/middleware.ts` has a type-only import lint error).
