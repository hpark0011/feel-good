---
status: completed
priority: p3
issue_id: "154"
tags: [code-review, simplicity, mirror, articles]
dependencies: []
---

# Remove Tooltip From Clear Search Button

## Problem Statement

The clear button has a Tooltip wrapper saying "Clear search", but this button only appears when the user is actively typing in the search input. The X icon is visually self-explanatory in context, and the `aria-label` already handles screen reader accessibility. The Tooltip adds 5 lines of JSX for negligible UX value.

## Findings

- **Source:** Code simplicity review of `cf6502fc`
- **Location:** `apps/mirror/features/articles/components/article-search-input.tsx` lines 92-104
- **Evidence:** Tooltip wraps a contextually obvious clear button that only appears mid-search

## Proposed Solutions

### Option A: Remove Tooltip, keep aria-label (Recommended)

```tsx
{isOpen && query.length > 0 && (
  <Button
    variant="ghost"
    size="icon-sm"
    onClick={() => onQueryChange("")}
    aria-label="Clear search"
  >
    <Icon name="XmarkCircleFillIcon" />
  </Button>
)}
```

- **Effort:** Trivial
- **Risk:** None — `aria-label` provides accessibility; tooltip was redundant

## Acceptance Criteria

- [ ] Clear button renders without Tooltip wrapper
- [ ] `aria-label="Clear search"` is preserved
- [ ] Unused Tooltip imports are removed if no other Tooltip remains (search button still uses one, so imports stay)

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-12 | Created from multi-agent code review | Tooltips on contextually obvious controls mid-interaction add noise, not clarity |
| 2026-02-12 | Fixed — removed Tooltip wrapper, kept `aria-label="Clear search"` on bare Button | — |
