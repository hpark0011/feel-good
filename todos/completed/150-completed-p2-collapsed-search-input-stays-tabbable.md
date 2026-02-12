---
status: completed
priority: p2
issue_id: "150"
tags: [code-review, accessibility, mirror, articles]
dependencies: []
---

# Collapsed Search Input Stays Tabbable

## Problem Statement

When search is closed, the input is visually hidden via width/opacity but remains in the DOM and focusable. Keyboard users can tab into an invisible control.

## Findings

- **Source:** Commit review of `cf6502fc`
- **Location:** `apps/mirror/features/articles/components/article-search-input.tsx` lines 72-87
- **Evidence:** Closed state uses `w-0 opacity-0` only; no `disabled`, `tabIndex`, or accessibility hiding is applied

## Proposed Solutions

### Option A: Make closed input non-interactive (Recommended)

- Set `tabIndex={isOpen ? 0 : -1}`
- Set `disabled={!isOpen}` (or `aria-hidden` with inert handling) while collapsed
- Ensure visual transition still works when reopening
- **Effort:** Small
- **Risk:** Low

### Option B: Conditionally render input only when open

- Mount input only for open state and use enter/exit animation strategy
- **Effort:** Medium
- **Risk:** Medium (animation/focus timing changes)

## Acceptance Criteria

- [ ] Closed search input cannot be focused via `Tab`
- [ ] Screen reader interaction reflects hidden/closed state
- [ ] Reopened input is focusable and functional

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-12 | Created from commit review | Visual hiding must be paired with interaction/accessibility hiding |
| 2026-02-12 | Fixed — added `tabIndex={isOpen ? 0 : -1}` to input | — |
