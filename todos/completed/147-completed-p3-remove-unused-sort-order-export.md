---
status: completed
priority: p3
issue_id: "147"
tags: [code-review, quality, mirror]
dependencies: []
---

# Remove Unused SortOrder Export from index.ts

## Problem Statement

`SortOrder` type is exported from `features/articles/index.ts` but is not consumed outside the articles feature. This is a speculative export that widens the public API surface unnecessarily.

## Findings

**Affected File:**
- `apps/mirror/features/articles/index.ts` (line 4)

```typescript
export type { SortOrder } from "./hooks/use-article-sort";
```

**Flagged by:** TypeScript Reviewer, Architecture Strategist, Code Simplicity Reviewer

## Proposed Solutions

Remove the line. Add it back when an external consumer actually needs it.
- Effort: Trivial
- Risk: None

## Acceptance Criteria

- [ ] `SortOrder` not in `index.ts` public API unless externally consumed

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-12 | Created from code review | YAGNI — only export what external consumers need |
