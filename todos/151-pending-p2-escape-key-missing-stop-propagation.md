---
status: pending
priority: p2
issue_id: "151"
tags: [code-review, accessibility, mirror, articles]
dependencies: []
---

# Escape Key Handler Missing stopPropagation

## Problem Statement

The Escape key handler in `ArticleSearchInput` does not call `e.stopPropagation()`. Since the toolbar contains an `AlertDialog` sibling, pressing Escape while the search input is focused could propagate up and dismiss a parent dialog or other keyboard-sensitive ancestor.

## Findings

- **Source:** Frontend races review of `cf6502fc`
- **Location:** `apps/mirror/features/articles/components/article-search-input.tsx` lines 46-50
- **Evidence:** `handleKeyDown` calls `onClose()` but does not stop the event from bubbling. The parent `ArticleToolbar` contains an `AlertDialog` that also listens for Escape.

## Proposed Solutions

### Option A: Add stopPropagation (Recommended)

```tsx
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === "Escape") {
    e.stopPropagation();
    onClose();
  }
};
```

- **Effort:** Trivial
- **Risk:** Low

## Acceptance Criteria

- [ ] Pressing Escape while search input is focused closes search only
- [ ] Parent AlertDialog is not dismissed by Escape from the search input
- [ ] Escape still works normally when search is closed

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-12 | Created from multi-agent code review | Escape handlers in nested interactive regions should stop propagation to prevent ancestor components from also responding |
