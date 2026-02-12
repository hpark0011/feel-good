---
status: pending
priority: p3
issue_id: "152"
tags: [code-review, consistency, mirror, articles]
dependencies: []
---

# Use cn() for Conditional Classes in Search Input

## Problem Statement

`ArticleSearchInput` uses template literal string concatenation for conditional classes on the expandable wrapper. The codebase rule (`.claude/rules/react-components.md`) says to always use `cn()` for conditional classes, and sibling component `animated-article-row.tsx` already uses `cn()`.

## Findings

- **Source:** TypeScript review + architecture review of `cf6502fc`
- **Location:** `apps/mirror/features/articles/components/article-search-input.tsx` lines 73-75
- **Evidence:** Template literal: `` `overflow-hidden transition-all duration-200 ease-out ${isOpen ? "w-[160px] opacity-100" : "w-0 opacity-0"}` ``

## Proposed Solutions

### Option A: Switch to cn() (Recommended)

```tsx
import { cn } from "@feel-good/utils/cn";

className={cn(
  "overflow-hidden transition-all duration-200 ease-out",
  isOpen ? "w-[160px] opacity-100" : "w-0 opacity-0",
)}
```

- **Effort:** Trivial
- **Risk:** None

## Acceptance Criteria

- [ ] Conditional class uses `cn()` instead of template literal
- [ ] Import added from `@feel-good/utils/cn`
- [ ] Visual behavior is unchanged

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-12 | Created from multi-agent code review | Codebase convention: always use cn() for conditional classes per react-components.md |
