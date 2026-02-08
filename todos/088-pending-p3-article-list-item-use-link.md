---
status: pending
priority: p3
issue_id: "088"
tags: [code-review, performance, accessibility, mirror]
dependencies: []
---

# ArticleListItem Should Use `<Link>` Instead of `useRouter().push`

## Problem Statement

Each `ArticleListItem` calls `useRouter()` and uses `router.push(href)` with `onClick`/`onKeyDown` handlers. This creates N router hook subscriptions for N rows, loses Next.js link prefetching, and breaks native browser behaviors (cmd+click for new tab, right-click context menu).

## Findings

- **Source:** performance-oracle, kieran-typescript-reviewer, pattern-recognition-specialist agents
- **Location:** `apps/mirror/app/(protected)/dashboard/articles/_components/article-list-item.tsx` lines 17-28
- **Evidence:** Each row calls `useRouter()` independently. `<Link>` would provide prefetching, proper `<a>` semantics, and no hook overhead.

## Proposed Solutions

### Option A: Replace with `<Link>` component (Recommended)
- Wrap table row content in Next.js `<Link>`
- Remove `useRouter`, `onClick`, `onKeyDown` handlers
- **Pros:** Prefetching, native link semantics, fewer hook calls, accessible
- **Cons:** May need CSS adjustment for link wrapping table rows
- **Effort:** Small
- **Risk:** Low

## Acceptance Criteria

- [ ] `ArticleListItem` uses `<Link>` for navigation
- [ ] `useRouter` removed from component
- [ ] Prefetching works on hover
- [ ] Keyboard navigation works natively

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-08 | Created from PR #105 code review | `<Link>` is always preferred over `router.push` for navigation |

## Resources

- PR: https://github.com/hpark0011/feel-good/pull/105
