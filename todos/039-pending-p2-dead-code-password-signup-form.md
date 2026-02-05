---
status: pending
priority: p2
issue_id: "039"
tags: [code-review, pr-103, auth, dead-code]
dependencies: []
---

# Remove Dead Code: PasswordSignUpForm in sign-up-block.tsx

## Problem Statement

`sign-up-block.tsx` imports `PasswordSignUpForm`, defines a slot for it, and resolves the slot variable, but never renders it in JSX. This is dead code left over from the password form removal.

## Findings

**Source:** PR #103 code review (multi-agent)

**Affected Files:**
- `packages/features/auth/blocks/sign-up-block.tsx`

**Details:**
- `PasswordSignUpForm` is imported (lines 6-8)
- `passwordForm` slot is defined in `SignUpBlockSlots` (line 23)
- Slot variable is resolved (line 45)
- But the component is never rendered in the JSX return

## Proposed Solutions

### Option A: Remove the dead import, slot, and variable (Recommended)
- **Pros:** Clean code, no confusion
- **Cons:** None
- **Effort:** Small
- **Risk:** None

## Recommended Action

Remove the `PasswordSignUpForm` import, the `passwordForm` slot definition from `SignUpBlockSlots`, and the slot variable resolution.

## Acceptance Criteria

- [ ] `PasswordSignUpForm` import removed from sign-up-block.tsx
- [ ] `passwordForm` slot removed from `SignUpBlockSlots`
- [ ] No dead slot variable resolution
- [ ] Build passes

## Work Log

| Date | Action | Outcome |
|------|--------|---------|
| 2026-02-05 | Created from PR #103 review | Pending |
