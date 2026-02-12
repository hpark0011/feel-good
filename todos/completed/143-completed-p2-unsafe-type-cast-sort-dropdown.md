---
status: completed
priority: p2
issue_id: "143"
tags: [code-review, typescript, quality, mirror]
dependencies: []
---

# Unsafe `as SortOrder` Type Cast in Sort Dropdown

## Problem Statement

`article-sort-dropdown.tsx` line 43 uses `v as SortOrder` to cast the `string` from Radix's `onValueChange` callback. This bypasses type checking — if a third radio item is added with a typo or wrong value, the cast silently masks the bug.

## Findings

**Affected File:**
- `apps/mirror/features/articles/components/article-sort-dropdown.tsx` (line 43)

```typescript
onValueChange={(v) => onChange(v as SortOrder)}
```

**Flagged by:** TypeScript Reviewer

## Proposed Solutions

### Option A: Type guard function (Recommended)
```typescript
const isSortOrder = (v: string): v is SortOrder =>
  v === "newest" || v === "oldest";

// In JSX:
onValueChange={(v) => {
  if (isSortOrder(v)) onChange(v);
}}
```
- Pros: Type-safe, future-proof, zero runtime cost in happy path
- Cons: 3 extra lines
- Effort: Small
- Risk: None

## Acceptance Criteria

- [ ] No `as` type assertions on Radix callback values
- [ ] Invalid values are silently ignored rather than propagated

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-12 | Created from code review | Prefer type guards over `as` casts at component boundaries |
