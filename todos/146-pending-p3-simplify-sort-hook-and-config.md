---
status: pending
priority: p3
issue_id: "146"
tags: [code-review, simplicity, mirror]
dependencies: []
---

# Consider Simplifying useArticleSort Hook and Animation Config

## Problem Statement

Two new files may be over-abstractions:

1. **`use-article-sort.ts`**: A 10-line wrapper around `useState` with no added logic
2. **`article-list.config.ts`**: A 20-line animation variants object imported in exactly one place

## Findings

**Counter-argument for keeping them:**
- `useArticleSort` co-locates the `SortOrder` type and follows the pattern of sibling hooks (`useArticleSelection`, `useArticleList`)
- `article-list.config.ts` follows greyboard's pattern of extracting animation config to `utils/*.config.ts`
- Both are consistent with monorepo conventions

**Argument for inlining:**
- `useArticleSort` is literally `useState` with a default value — zero logic
- Config is only used by one consumer
- 2 fewer files, 6 fewer import paths

**Flagged by:** Code Simplicity Reviewer, Architecture Strategist

## Proposed Solutions

### Option A: Keep as-is (pattern consistency)
- Pros: Matches sibling hook pattern, follows greyboard config convention
- Cons: Two files for trivial content
- Effort: None
- Risk: None

### Option B: Inline both (simplicity)
- Move `SortOrder` type to `article-sort-dropdown.tsx` or a `types.ts`
- Inline `useState<SortOrder>("newest")` in `scrollable-article-list.tsx`
- Inline `articleRowVariants` in `animated-article-row.tsx`
- Delete `use-article-sort.ts` and `utils/article-list.config.ts`
- Pros: 2 fewer files, simpler imports
- Cons: Breaks consistency with sibling patterns
- Effort: Small
- Risk: None

## Acceptance Criteria

- [ ] Decision made and applied consistently

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-12 | Created from code review | Balance KISS with pattern consistency in monorepos |
