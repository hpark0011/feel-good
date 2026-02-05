---
status: pending
priority: p2
issue_id: "040"
tags: [code-review, pr-103, auth, consistency]
dependencies: ["039"]
---

# Fix Asymmetric Slot Cleanup Between Login and SignUp Blocks

## Problem Statement

`LoginBlock` had its `passwordForm` slot and `forgotPasswordHref` fully removed, but `SignUpBlock` still retains the `passwordForm` slot definition. This creates an inconsistency in the auth block API.

## Findings

**Source:** PR #103 code review (multi-agent)

**Affected Files:**
- `packages/features/auth/blocks/login-block.tsx`
- `packages/features/auth/blocks/sign-up-block.tsx`

**Details:**
- `LoginBlockSlots` no longer has `passwordForm` or `forgotPasswordHref`
- `SignUpBlockSlots` still defines `passwordForm` (even though it's dead code)
- If the intent is to remove password forms from both blocks, the cleanup should be symmetric

## Proposed Solutions

### Option A: Remove passwordForm slot from SignUpBlock to match LoginBlock (Recommended)
- **Pros:** Consistent API across blocks
- **Cons:** None
- **Effort:** Small
- **Risk:** Low

### Option B: Keep passwordForm in SignUpBlock if sign-up still needs password
- **Pros:** Preserves password registration flow
- **Cons:** Creates intentional asymmetry that should be documented
- **Effort:** None
- **Risk:** Low

## Recommended Action

Align both blocks — if password forms are removed from login, remove from sign-up too. If sign-up intentionally keeps password registration, render the component and document the asymmetry.

## Acceptance Criteria

- [ ] LoginBlock and SignUpBlock slot APIs are intentionally aligned or documented
- [ ] No dead slot definitions remain
- [ ] Build passes

## Work Log

| Date | Action | Outcome |
|------|--------|---------|
| 2026-02-05 | Created from PR #103 review | Pending |
