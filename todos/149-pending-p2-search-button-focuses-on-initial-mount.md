---
status: pending
priority: p2
issue_id: "149"
tags: [code-review, accessibility, mirror, articles]
dependencies: []
---

# Search Button Focuses on Initial Mount

## Problem Statement

`ArticleSearchInput` focuses the search toggle button whenever `isOpen` is false. This also runs on initial mount, which can steal focus unexpectedly from keyboard or assistive tech users.

## Findings

- **Source:** Commit review of `cf6502fc`
- **Location:** `apps/mirror/features/articles/components/article-search-input.tsx` lines 39-44
- **Evidence:** `useEffect(() => { if (!isOpen) buttonRef.current?.focus(); }, [isOpen])` runs after first render with `isOpen=false`

## Proposed Solutions

### Option A: Focus only on open -> closed transition (Recommended)

- Track previous `isOpen` value with a ref
- Only focus button when previous `isOpen` was `true` and current is `false`
- **Effort:** Small
- **Risk:** Low

### Option B: Remove automatic focus return

- Drop the close-focus effect and rely on default browser focus flow
- **Effort:** Trivial
- **Risk:** Low

## Acceptance Criteria

- [ ] Initial render does not programmatically move focus
- [ ] Closing the open search input returns focus to the search toggle button
- [ ] Keyboard navigation order remains predictable

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-12 | Created from commit review | Focus management should react to state transitions, not mount state |

