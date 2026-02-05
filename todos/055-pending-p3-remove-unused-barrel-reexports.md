---
status: pending
priority: p3
issue_id: "055"
tags: [code-review, pr-103, auth, imports, yagni]
dependencies: []
---

# Simplify components/index.ts Barrel File

## Problem Statement

`packages/features/auth/components/index.ts` re-exports forms, views, and shared components, but no external consumer imports from this barrel. All block files import directly from specific paths. The barrel exists as dead indirection.

## Findings

**Source:** PR #103 code simplicity review

**Affected Files:**
- `packages/features/auth/components/index.ts`
- `packages/features/auth/index.ts` (the only consumer, for `createSessionProvider`)

**Details:**
- The barrel re-exports `forms`, `views`, and `shared`
- No code outside the package imports from `@feel-good/features/auth/components`
- Blocks import directly: `../components/forms/specific-form`
- Only `createSessionProvider` is consumed via `auth/index.ts`

## Proposed Solutions

### Option A: Point auth/index.ts directly to session-provider (Recommended)
- **Pros:** Removes unused barrel, simpler import graph
- **Cons:** None
- **Effort:** Trivial
- **Risk:** None

## Acceptance Criteria

- [ ] `auth/index.ts` imports `createSessionProvider` directly from `./components/session-provider`
- [ ] `components/index.ts` simplified or removed
- [ ] Build passes

## Work Log

| Date | Action | Outcome |
|------|--------|---------|
| 2026-02-05 | Created from PR #103 simplicity review | Pending |
