---
status: pending
priority: p3
issue_id: "059"
tags: [code-review, pr-103, auth, dead-code, cleanup]
dependencies: []
---

# Remove Deprecated createAppAuthClient Export

## Problem Statement

`packages/features/auth/client.ts` still exports a deprecated `createAppAuthClient` function. Since PR #103 removes the legacy compatibility layer, this is a natural time to remove remaining deprecations.

## Findings

**Source:** PR #103 architecture review

**Affected Files:**
- `packages/features/auth/client.ts` (lines ~55-58)

**Details:**
- The function is marked as deprecated
- Part of the legacy API surface that this PR is cleaning up
- Should verify no consumers remain before removal

## Proposed Solutions

### Option A: Remove if no consumers remain (Recommended)
- **Pros:** Completes the legacy cleanup
- **Cons:** None if unused
- **Effort:** Trivial
- **Risk:** None (verify first)

## Acceptance Criteria

- [ ] No remaining imports of `createAppAuthClient` in the monorepo
- [ ] Deprecated function removed from `client.ts`
- [ ] Build passes

## Work Log

| Date | Action | Outcome |
|------|--------|---------|
| 2026-02-05 | Created from PR #103 architecture review | Pending |
