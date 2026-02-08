---
status: pending
priority: p2
issue_id: "085"
tags: [code-review, performance, architecture, mirror]
dependencies: []
---

# Dashboard Page Should Be Server Component (Client Boundary Too High)

## Problem Statement

The entire dashboard `page.tsx` is marked `"use client"`, forcing `DashboardView` (static content) and `ProfileImage` (no interactivity) to be client-rendered. This defeats Next.js server rendering for the profile section, increases the JavaScript bundle, and slows First Contentful Paint.

Mirror's `CLAUDE.md` states the convention is "Server components by default."

## Findings

- **Source:** performance-oracle, architecture-strategist, code-simplicity-reviewer agents
- **Location:** `apps/mirror/app/(protected)/dashboard/page.tsx` line 1
- **Evidence:** `DashboardView` has zero hooks, no state, no event handlers. `ProfileImage` is a static `<video>` tag. Only `useSession` and `useArticleList` need client-side state. The `[slug]/page.tsx` also unnecessarily uses `"use client"` when server params are available.

## Proposed Solutions

### Option A: Push client boundary down (Recommended)
- Remove `"use client"` from `page.tsx`
- Create `<ArticleListSection />` client component that owns `useArticleList` + `useSession` loading
- Keep `DashboardView` and `ProfileImage` as server components
- Convert `[slug]/page.tsx` to use server `params` prop instead of `useParams`

```
page.tsx (server component)
  -> DashboardView (server, static content)
  -> ArticleListSection ("use client", owns pagination + session check)
```

- **Pros:** Server-rendered profile content, smaller JS bundle, faster FCP
- **Cons:** Slightly more files
- **Effort:** Medium
- **Risk:** Low

### Option B: Keep as-is (prototype acceptable)
- **Pros:** No change needed
- **Cons:** All content client-rendered, larger bundle
- **Effort:** None
- **Risk:** Low (prototype)

## Recommended Action

Option A for production readiness.

## Technical Details

- **Affected files:**
  - `apps/mirror/app/(protected)/dashboard/page.tsx`
  - New: `apps/mirror/app/(protected)/dashboard/_components/article-list-section.tsx`
  - `apps/mirror/app/(protected)/dashboard/articles/[slug]/page.tsx`

## Acceptance Criteria

- [ ] `page.tsx` is a server component
- [ ] `DashboardView` renders server-side
- [ ] Article list interactivity in a client wrapper
- [ ] `[slug]/page.tsx` uses server params prop
- [ ] Build passes

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-08 | Created from PR #105 code review | Static content should stay server-rendered |

## Resources

- PR: https://github.com/hpark0011/feel-good/pull/105
