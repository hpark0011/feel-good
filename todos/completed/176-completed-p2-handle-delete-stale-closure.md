---
status: completed
priority: p2
issue_id: "176"
tags: [code-review, race-condition, state, mirror]
dependencies: []
---

# handleDelete Can Use Stale Selection When Filter Changes During Dialog

## Problem Statement

`handleDelete` captures `selectedSlugs` in its closure. If the user opens the delete confirmation dialog, then a filter/search change fires (clearing the selection), and then the user confirms the delete — the callback executes with stale (empty) `selectedSlugs`. The failure mode is safe (nothing gets deleted instead of wrong things), but the UX is confusing: the dialog says "Delete 3 articles" but confirming does nothing.

## Findings

- **Location:** `apps/mirror/features/articles/context/article-workspace-context.tsx:134-143`
- **Trigger scenario:** Open delete dialog → change filter dimension → confirm delete
- **Current behavior:** Silent no-op (0 articles deleted)
- **Source:** PR #121 — frontend races reviewer flagged as High severity

## Proposed Solutions

### Option A: Ref-based selection read (Recommended)
Store `selectedSlugs` in a ref, read at invocation time instead of closure time.

```tsx
const selectedSlugsRef = useRef(selectedSlugs);
selectedSlugsRef.current = selectedSlugs;

const handleDelete = useCallback(() => {
  const currentSelection = selectedSlugsRef.current;
  const visibleSlugs = new Set(allSlugs);
  setArticles((prev) =>
    prev.filter(
      (a) => !(currentSelection.has(a.slug) && visibleSlugs.has(a.slug)),
    ),
  );
  clearSelection();
}, [allSlugs, clearSelection]);
```

- **Effort:** Small
- **Risk:** Low

### Option B: Close dialog on selection clear
When selection is cleared (via filter/search change), also close the delete dialog. Prevents the stale state scenario entirely.

- **Effort:** Small
- **Risk:** Low — but adds coupling between filter logic and dialog state

## Acceptance Criteria

- [ ] Delete dialog confirms with current selection, not stale closure
- [ ] If selection clears while dialog is open, either dialog closes or delete handles it gracefully
- [ ] No articles are incorrectly deleted

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-13 | Created from PR #121 review | Safe failure mode (no-op) makes this P2 not P1 |
