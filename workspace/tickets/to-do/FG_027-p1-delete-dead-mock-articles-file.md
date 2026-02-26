---
id: FG_027
title: "Dead mock-articles.ts file removed after Convex migration"
date: 2026-02-26
type: chore
status: to-do
priority: p1
description: "The mock-articles.ts file (~794 lines) is no longer imported anywhere after the articles migration to Convex. MOCK_ARTICLES and findArticleBySlug are orphaned exports. The file should be deleted to remove dead code and prevent confusion."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "grep -r 'mock-articles' apps/mirror/features/articles/ returns zero matches"
  - "File apps/mirror/features/articles/lib/mock-articles.ts does not exist"
  - "pnpm build --filter=@feel-good/mirror succeeds"
owner_agent: "Cleanup agent"
---

# Dead mock-articles.ts file removed after Convex migration

## Context

PR #172 migrated Mirror's articles feature from hardcoded `MOCK_ARTICLES` to a Convex backend. The barrel export in `features/articles/index.ts` no longer re-exports `MOCK_ARTICLES` or `findArticleBySlug`. However, the source file `apps/mirror/features/articles/lib/mock-articles.ts` (~794 lines of mock data and helper functions) still exists in the tree with zero consumers. Flagged by 4 of 7 review agents.

## Goal

The dead mock-articles file is deleted, reducing codebase size by ~794 lines and eliminating a source of confusion about the article data source.

## Scope

- Delete `apps/mirror/features/articles/lib/mock-articles.ts`
- Verify no remaining imports reference the file

## Out of Scope

- Seeding Convex with article data (separate concern)
- Removing the `lib/` directory if other files remain in it

## Approach

Delete the file and verify the build passes. No other code references it.

- **Effort:** Small
- **Risk:** Low

## Implementation Steps

1. Run `grep -r 'mock-articles' apps/mirror/` to confirm zero imports
2. Delete `apps/mirror/features/articles/lib/mock-articles.ts`
3. Run `pnpm build --filter=@feel-good/mirror` to verify no breakage

## Constraints

- Deletion-only change, no new code
- Must not break the build

## Resources

- PR #172: feat(mirror): migrate articles to Convex
- Code review findings: TypeScript reviewer, Architecture strategist, Code simplicity reviewer
