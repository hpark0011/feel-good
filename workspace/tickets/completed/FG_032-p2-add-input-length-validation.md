---
id: FG_032
title: "Article mutations validate input string lengths"
date: 2026-02-26
type: improvement
status: to-do
priority: p2
description: "The create and update article mutations accept title, slug, and category as v.string() with no length constraints. Convex strings allow up to 1MB, so an attacker could store excessively long values. Runtime length checks should enforce reasonable limits (title: 500, slug: 200, category: 100)."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "packages/convex/convex/articles/mutations.ts create handler throws if title exceeds 500 characters"
  - "packages/convex/convex/articles/mutations.ts create handler throws if slug exceeds 200 characters"
  - "packages/convex/convex/articles/mutations.ts create handler throws if category exceeds 100 characters"
  - "The same length checks exist in the update handler for the corresponding optional fields"
  - "pnpm exec convex codegen succeeds"
owner_agent: "Security hardening agent"
---

# Article mutations validate input string lengths

## Context

In `packages/convex/convex/articles/mutations.ts`, the `create` and `update` mutations accept `title`, `slug`, and `category` as `v.string()` with no length constraints. Convex strings have a 1MB size limit, which is extremely generous. An authenticated user could create articles with excessively long titles or slugs, causing storage waste and potential performance degradation. Flagged by the security sentinel.

## Goal

All string fields in article mutations have runtime maximum length checks that reject excessively long inputs with clear error messages.

## Scope

- Add length validation in `create` handler for title (500), slug (200), category (100)
- Add the same validations in `update` handler for the corresponding optional fields

## Out of Scope

- Adding Convex validator-level length constraints (not supported natively)
- Validating body content size (separate concern)

## Approach

Add runtime checks at the top of each handler, before any database operations. Throw descriptive errors for violations.

- **Effort:** Small
- **Risk:** Low

## Implementation Steps

1. In `packages/convex/convex/articles/mutations.ts` create handler, add length checks after `getAppUser` call
2. Add similar checks in the update handler for non-undefined fields
3. Run `pnpm exec convex codegen` to verify
4. Run `pnpm build --filter=@feel-good/mirror` to verify

## Constraints

- Error messages must clearly state the limit and the actual length
- Must not break existing article creation flows

## Resources

- PR #172: feat(mirror): migrate articles to Convex
- Code review finding: Security sentinel
