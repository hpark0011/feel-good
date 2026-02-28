---
id: FG_029
title: "Articles getByUsername query has a safety limit and excludes body"
date: 2026-02-26
type: perf
status: to-do
priority: p1
description: "The getByUsername articles query uses .collect() which loads all articles with full body content into memory. For users with many articles, this will cause large payloads (potentially exceeding Convex's 8MB limit). The list view never renders article bodies — it only needs title, date, category, and status. Adding a safety limit and excluding body from the list query would prevent scalability issues."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "packages/convex/convex/articles/queries.ts getByUsername query does not use .collect() without a limit, or uses .take(N) with N <= 200"
  - "The list query return shape does not include the body field"
  - "A separate articleSummaryReturnValidator exists in helpers.ts that omits body"
  - "pnpm build --filter=@feel-good/mirror succeeds"
  - "apps/mirror/features/articles/hooks/use-article-search.ts does not call getPlainText on article.body (search uses a server-provided field or is removed)"
owner_agent: "Backend optimization agent"
---

# Articles getByUsername query has a safety limit and excludes body

## Context

In `packages/convex/convex/articles/queries.ts:22-24`, the `getByUsername` query calls `.collect()` which loads every article for a user into memory, including the full `body` field (rich-text JSON, potentially 5-50KB per article). The article list UI only displays title, date, category, and status — it never renders body content. The `body` is only consumed by `useArticleSearch` for client-side full-text search (via `getPlainText()`). At 100+ articles, payloads reach 500KB-5MB, and at 500+ they risk exceeding Convex's 8MB limit. Flagged by 4 review agents.

## Goal

The list query returns only the fields needed for the list view (excluding `body`), with a safety limit on the number of articles returned, preventing unbounded memory and bandwidth consumption.

## Scope

- Create an `articleSummaryReturnValidator` in `helpers.ts` that omits `body`
- Modify `getByUsername` to exclude `body` from its return shape and add `.take(200)` safety limit
- Update the frontend `Article` type to have a list variant without `body`
- Remove `getPlainText(article.body)` from `useArticleSearch` (search on title + category only, or add a server-side `bodyExcerpt` field)

## Out of Scope

- Server-side pagination with cursors (future improvement)
- Convex search indexes for full-text search
- Modifying the `getBySlug` query (it correctly returns a single article with body)

## Approach

Split the return validator into a summary (list) variant and a full (detail) variant. The list query returns the summary shape without body. Client-side search falls back to title + category matching.

- **Effort:** Medium
- **Risk:** Low

## Implementation Steps

1. Add `articleSummaryReturnValidator` to `packages/convex/convex/articles/helpers.ts` (same as `articleReturnValidator` but without `body`)
2. Update `getByUsername` in `packages/convex/convex/articles/queries.ts` to use the summary validator and add `.take(200)`
3. Exclude `body` from the return object mapping in `getByUsername`
4. Create an `ArticleSummary` type in `apps/mirror/features/articles/types.ts` (without `body`)
5. Update `useArticleSearch` in `apps/mirror/features/articles/hooks/use-article-search.ts` to search title + category only (remove `getPlainText(article.body)` call)
6. Update `ArticleWorkspaceProvider` and `ArticleListContext` to use `ArticleSummary` instead of `Article`
7. Run `pnpm exec convex codegen` in `packages/convex`
8. Run `pnpm build --filter=@feel-good/mirror` to verify

## Constraints

- Must not change the `getBySlug` query (detail view still needs full body)
- Must not break the article list UI

## Resources

- PR #172: feat(mirror): migrate articles to Convex
- Code review findings: Performance oracle, Architecture strategist, TypeScript reviewer, Agent-native reviewer
