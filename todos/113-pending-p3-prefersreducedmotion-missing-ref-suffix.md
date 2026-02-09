---
status: pending
priority: p3
issue_id: "113"
tags: [code-review, naming, mirror, profile]
dependencies: []
---

# prefersReducedMotion Missing Ref Suffix

## Problem Statement

In `use-bottom-sheet.ts`, `prefersReducedMotion` is a `useRef` but lacks the `Ref` suffix convention used by every other ref in the same hook (`startYRef`, `currentYRef`, `bgRef`, etc.). This inconsistency makes it harder to distinguish refs from state at a glance.

## Findings

- **Source:** kieran-typescript-reviewer agent
- **Location:** `apps/mirror/features/profile/hooks/use-bottom-sheet.ts`

## Proposed Solutions

### Option A: Rename to prefersReducedMotionRef (Recommended)
- **Effort:** Trivial
- **Risk:** None

## Acceptance Criteria

- [ ] Ref renamed to `prefersReducedMotionRef`
- [ ] All usages updated

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-09 | Created from PR #106 review | Consistent Ref suffix for all useRef variables |

## Resources

- PR: https://github.com/hpark0011/feel-good/pull/106
