---
id: FG_033
title: "Article creation rejects empty or invalid slugs"
date: 2026-02-26
type: fix
status: to-do
priority: p2
description: "The generateSlug helper returns an empty string when given a title that is empty, whitespace-only, or contains only symbols. The create mutation does not guard against empty slugs, which would produce an unroutable article at /@username/."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "packages/convex/convex/articles/helpers.ts generateSlug throws or returns a fallback for empty/whitespace-only/symbol-only titles"
  - "packages/convex/convex/articles/mutations.ts create handler throws if the resolved slug is empty"
  - "pnpm exec convex codegen succeeds"
owner_agent: "Backend validation agent"
---

# Article creation rejects empty or invalid slugs

## Context

In `packages/convex/convex/articles/helpers.ts:29-34`, `generateSlug` processes the title through regex substitution. If the title is empty, whitespace-only, or contains only non-alphanumeric characters (e.g., "!!!"), the function returns an empty string `""`. The `create` mutation in `mutations.ts` does not validate that the resolved slug is non-empty before inserting. This would produce an article with slug `""`, which is unroutable. Flagged by the TypeScript reviewer and security sentinel.

## Goal

Articles cannot be created with empty or blank slugs. The system either rejects the input or generates a fallback slug.

## Scope

- Add a guard in `create` mutation that throws if the resolved slug is empty
- Optionally improve `generateSlug` to detect empty results

## Out of Scope

- Slug format validation beyond emptiness (e.g., max length is covered by FG_032)
- Auto-generating unique slugs on collision

## Approach

Add a simple check after slug resolution in the create handler: if the slug is empty after generation/sanitization, throw an error. Optionally, `generateSlug` itself can throw on empty input.

- **Effort:** Small
- **Risk:** Low

## Implementation Steps

1. In `packages/convex/convex/articles/mutations.ts` create handler, add `if (!slug) throw new Error("Slug cannot be empty")` after slug resolution
2. Optionally update `generateSlug` in `helpers.ts` to throw on empty/whitespace titles
3. Run `pnpm exec convex codegen` to verify
4. Run `pnpm build --filter=@feel-good/mirror` to verify

## Constraints

- Must not change slug generation logic for valid titles

## Resources

- PR #172: feat(mirror): migrate articles to Convex
- Code review findings: TypeScript reviewer, Security sentinel
