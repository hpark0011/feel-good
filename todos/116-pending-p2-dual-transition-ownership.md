---
status: pending
priority: p2
issue_id: "116"
tags: [code-review, race-condition, mirror, profile]
dependencies: []
---

# Dual Transition Ownership: Inline Style vs CSS Class

## Problem Statement

`SheetContainer` applies a CSS transition via Tailwind class (`transition-transform duration-300 ease-[...]`) when `!isDragging`, but `applyTransform` in `use-bottom-sheet.ts` also sets `style.transition` imperatively. Inline styles always win in specificity, so the Tailwind class is effectively dead code on the sheet element. Two owners for the same CSS property creates a race where the sheet may teleport instead of animating, or animate when it should track 1:1 with the finger.

## Findings

- **Source:** julik-frontend-races-reviewer agent
- **Locations:**
  - `apps/mirror/features/profile/components/sheet-container.tsx` lines 25-27
  - `apps/mirror/features/profile/hooks/use-bottom-sheet.ts` `applyTransform` function

## Proposed Solutions

### Option A: Let applyTransform own transitions entirely (Recommended)
Remove the Tailwind transition class from `SheetContainer` and manage all transitions in `applyTransform` via inline style. This is consistent with the imperative DOM approach already established.
- **Effort:** Low
- **Risk:** Low

### Option B: Let CSS class own transitions, remove inline style.transition
Remove `style.transition` from `applyTransform` and rely solely on the `isDragging` class toggle.
- **Effort:** Low
- **Risk:** May conflict with imperative transform updates during drag

## Acceptance Criteria

- [ ] Single authority for transition property on the sheet element
- [ ] No visual teleport or stutter during drag-release-drag sequences

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-09 | Created from PR #106 review | Never have two owners for the same CSS property on one element |

## Resources

- PR: https://github.com/hpark0011/feel-good/pull/106
