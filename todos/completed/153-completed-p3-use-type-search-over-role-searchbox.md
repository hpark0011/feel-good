---
status: completed
priority: p3
issue_id: "153"
tags: [code-review, accessibility, mirror, articles]
dependencies: []
---

# Use type="search" Instead of type="text" + role="searchbox"

## Problem Statement

The search input uses `type="text"` with an explicit `role="searchbox"`. Native HTML `type="search"` provides the same accessibility semantics without the extra attribute, and is the preferred approach.

## Findings

- **Source:** TypeScript review + simplicity review of `cf6502fc`
- **Location:** `apps/mirror/features/articles/components/article-search-input.tsx` lines 79, 85
- **Evidence:** `type="text"` with `role="searchbox"` — native `type="search"` achieves the same result with less code

## Proposed Solutions

### Option A: Swap to type="search" (Recommended)

```tsx
<input
  type="search"
  // remove role="searchbox"
  ...
/>
```

- **Effort:** Trivial
- **Risk:** None — `type="search"` may add a browser-native clear button on some platforms; style with `appearance-none` if needed

## Acceptance Criteria

- [ ] Input uses `type="search"` instead of `type="text"`
- [ ] `role="searchbox"` attribute is removed
- [ ] No unexpected browser-native clear button appears (or is styled appropriately)

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-12 | Created from multi-agent code review | Prefer native HTML semantics over explicit ARIA roles when equivalent |
| 2026-02-12 | Fixed — changed `type="text"` to `type="search"`, removed `role="searchbox"` | — |
