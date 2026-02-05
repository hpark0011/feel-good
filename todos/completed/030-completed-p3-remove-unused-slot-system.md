---
status: completed
priority: p3
issue_id: "030"
tags: [code-review, yagni, auth]
dependencies: []
---

# Remove Unused Slot System (YAGNI)

## Problem Statement

The slot system in LoginBlock and SignUpBlock allows swapping internal components, but there are no current consumers using this feature. This is building extensibility for a hypothetical future need.

## Resolution

Removed the entire slot system from both blocks. Components are now used directly instead of through slot indirection.

**Changes made:**
- `packages/features/auth/blocks/login-block.tsx` — Removed `LoginBlockSlots` interface, `slots` prop, and slot variable resolution. Components (`MagicLinkLoginForm`, `OAuthButtons`) are rendered directly.
- `packages/features/auth/blocks/sign-up-block.tsx` — Removed `SignUpBlockSlots` interface, `slots` prop, slot variable resolution, and dead `PasswordSignUpForm` import. Components (`MagicLinkSignUpForm`, `OAuthButtons`) are rendered directly.
- `packages/features/auth/blocks/index.ts` — Removed `LoginBlockSlots` and `SignUpBlockSlots` type exports.

**Also resolves:**
- Todo 039 (dead code: PasswordSignUpForm in sign-up-block.tsx) — fully resolved by removing all slots
- Todo 040 (asymmetric slot cleanup) — fully resolved by removing all slots from both blocks

## Work Log

| Date | Action | Outcome |
|------|--------|---------|
| 2026-02-03 | Created from code review | Simplicity reviewer identified YAGNI violation |
| 2026-02-05 | Implemented Option A | Removed slot system from both blocks, ~30 lines saved |
