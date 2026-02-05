---
status: completed
priority: p2
issue_id: "050"
tags: [code-review, pr-103, auth, ui, layout]
dependencies: []
---

# Add Missing max-w-md to magic-link-sign-up-view Card

## Problem Statement

`magic-link-sign-up-view.tsx` Card uses `w-full` only, missing the `max-w-md` class that all other auth view Cards have. This means the sign-up card will expand to fill its parent without constraint.

## Findings

**Source:** PR #103 pattern recognition review

**Affected Files:**
- `packages/features/auth/views/magic-link-sign-up-view.tsx` (lines 43, 69)

**Details:**
All other auth views consistently use `max-w-md` on their Card:
- `magic-link-login-view.tsx` — `max-w-md`
- `password-login-view.tsx` — `max-w-md`
- `password-sign-up-view.tsx` — `max-w-md`
- `forgot-password-view.tsx` — `max-w-md`
- `reset-password-view.tsx` — `max-w-md`
- **`magic-link-sign-up-view.tsx`** — **missing**

## Proposed Solutions

### Option A: Add max-w-md to match other views (Recommended)
- **Pros:** Consistent width across all auth cards
- **Cons:** None
- **Effort:** Trivial
- **Risk:** None

## Acceptance Criteria

- [x] Both Card instances in magic-link-sign-up-view.tsx include `max-w-md`
- [x] Card width matches other auth views visually

## Work Log

| Date | Action | Outcome |
|------|--------|---------|
| 2026-02-05 | Created from PR #103 pattern recognition review | Pending |
| 2026-02-05 | Added `max-w-md` to both Card instances (lines 43, 69) | Completed |
