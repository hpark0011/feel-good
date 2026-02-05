---
status: pending
priority: p2
issue_id: "041"
tags: [code-review, pr-103, auth, hooks, data-integrity]
dependencies: []
---

# Document or Fix Hardcoded name: "" in usePasswordSignUp

## Problem Statement

`use-password-sign-up.ts` removed the `name` field from its state and return type, but hardcodes `name: ""` in the sign-up API call. This sends an empty string for every registration without explanation.

## Findings

**Source:** PR #103 code review (multi-agent)

**Affected Files:**
- `packages/features/auth/hooks/use-password-sign-up.ts` (line ~71)

**Details:**
- The hook previously managed `name` as form state
- Now `name` is hardcoded as `""` in the API call:
  ```typescript
  await authClient.signUp.email(
    { name: "", email, password },
  ```
- No comment explains why, or whether the backend requires it
- Better Auth may require a non-empty name field

## Proposed Solutions

### Option A: Add an explanatory comment (Recommended minimum)
- **Pros:** Documents the intent for future maintainers
- **Cons:** Still sends empty string
- **Effort:** Trivial
- **Risk:** None

### Option B: Derive name from email or make it optional
- **Pros:** Better data quality
- **Cons:** May require backend schema changes
- **Effort:** Small
- **Risk:** Low

### Option C: Re-add name field to sign-up form
- **Pros:** Captures real user name
- **Cons:** More form fields, UX trade-off
- **Effort:** Medium
- **Risk:** Low

## Recommended Action

At minimum, add a comment explaining why `name: ""` is acceptable. Ideally, derive a default or make the field optional.

## Acceptance Criteria

- [ ] `name: ""` is documented with a comment explaining the decision
- [ ] Better Auth does not reject empty name (verified)
- [ ] No data integrity issues from empty name field

## Work Log

| Date | Action | Outcome |
|------|--------|---------|
| 2026-02-05 | Created from PR #103 review | Pending |
