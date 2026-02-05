---
status: completed
priority: p3
issue_id: "047"
tags: [code-review, pr-103, auth, ui, design]
dependencies: []
---

# Review border-transparent on Auth Cards

## Problem Statement

Auth view Cards use `border-transparent` alongside `rounded-4xl`. The transparent border adds invisible spacing which may cause subtle alignment issues. Consider whether `border-none` or removing the border class entirely is more appropriate.

## Findings

**Source:** PR #103 code review (multi-agent)

**Affected Files:**
- `packages/features/auth/views/magic-link-login-view.tsx`
- `packages/features/auth/views/magic-link-sign-up-view.tsx`
- `packages/features/auth/views/password-login-view.tsx`

**Details:**
- Cards use `className="w-full max-w-md rounded-4xl border-transparent p-0"`
- `border-transparent` still renders a 1px border (just invisible), consuming space
- This may be intentional for animation states or theme transitions

## Proposed Solutions

### Option A: Verify intent and document (Recommended)
- **Pros:** No change if intentional
- **Cons:** None
- **Effort:** Trivial
- **Risk:** None

### Option B: Replace with border-none if no animation/transition need
- **Pros:** Cleaner, no phantom spacing
- **Cons:** May break hover/focus border transitions
- **Effort:** Trivial
- **Risk:** Low

## Acceptance Criteria

- [ ] `border-transparent` usage is intentional and documented, or replaced

## Work Log

| Date | Action | Outcome |
|------|--------|---------|
| 2026-02-05 | Created from PR #103 review | Pending |
