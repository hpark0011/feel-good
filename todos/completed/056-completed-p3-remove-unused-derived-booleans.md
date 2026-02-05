---
status: completed
priority: p3
issue_id: "056"
tags: [code-review, pr-103, auth, hooks, yagni]
dependencies: []
---

# Remove Unused Derived Booleans from usePasswordSignUp

## Problem Statement

`usePasswordSignUp` returns `isLoading`, `isSuccess`, and `isError` derived from `status`, but no consumer uses them. The sole consumer destructures `status` directly.

## Findings

**Source:** PR #103 code simplicity review

**Affected Files:**
- `packages/features/auth/hooks/use-password-sign-up.ts` (lines ~107-109)

**Details:**
```typescript
isLoading: status === "loading",
isSuccess: status === "success",
isError: status === "error",
```
- The only consumer (`password-sign-up-form.tsx`) destructures `status` directly
- The view component checks `status === "loading"` and `status === "success"` itself
- These 3 derived values are dead convenience API

## Proposed Solutions

### Option A: Remove the 3 derived booleans and their interface types (Recommended)
- **Pros:** 6 lines removed, simpler return type
- **Cons:** None
- **Effort:** Trivial
- **Risk:** None

## Acceptance Criteria

- [ ] `isLoading`, `isSuccess`, `isError` removed from hook return and interface
- [ ] No consumers break (verify none reference them)
- [ ] Build passes

## Work Log

| Date | Action | Outcome |
|------|--------|---------|
| 2026-02-05 | Created from PR #103 simplicity review | Pending |
