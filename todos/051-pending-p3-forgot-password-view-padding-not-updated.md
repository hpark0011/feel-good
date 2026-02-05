---
status: pending
priority: p3
issue_id: "051"
tags: [code-review, pr-103, auth, ui, design]
dependencies: ["045"]
---

# Update forgot-password-view.tsx to Use New Card Padding

## Problem Statement

`forgot-password-view.tsx` was not touched by PR #103 and still uses the old `p-4 py-8 pb-10` Card padding, while all other auth views were updated to `p-0`. Additionally, `password-sign-up-view.tsx` success state has no explicit padding class at all.

## Findings

**Source:** PR #103 pattern recognition review

**Affected Files:**
- `packages/features/auth/views/forgot-password-view.tsx` (lines 41, 55)
- `packages/features/auth/views/password-sign-up-view.tsx` (line 46 — success state)

**Details:**
| View | State | Padding |
|------|-------|---------|
| forgot-password-view | success | `p-4 py-8 pb-10` (old) |
| forgot-password-view | default | `p-4 py-8 pb-10` (old) |
| password-sign-up-view | success | no padding class (falls back to Card default) |
| All other views | all | `p-0` (new) |

## Proposed Solutions

### Option A: Apply p-0 to missed views (Recommended)
- **Pros:** Consistent padding across all auth views
- **Cons:** None
- **Effort:** Trivial
- **Risk:** None

## Acceptance Criteria

- [ ] `forgot-password-view.tsx` Cards use `p-0`
- [ ] `password-sign-up-view.tsx` success Card uses `p-0`
- [ ] All auth view Cards have consistent padding

## Work Log

| Date | Action | Outcome |
|------|--------|---------|
| 2026-02-05 | Created from PR #103 pattern recognition review | Pending |
