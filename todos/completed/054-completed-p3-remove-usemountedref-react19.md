---
status: completed
priority: p3
issue_id: "054"
tags: [code-review, pr-103, auth, hooks, yagni]
dependencies: []
---

# Remove useMountedRef — Unnecessary in React 19

## Problem Statement

`useMountedRef` guards against setting state on unmounted components, a pattern from React 16-17 that is unnecessary in React 18+ (warning removed in 18.3) and completely obsolete in React 19. The project uses React 19.

## Findings

**Source:** PR #103 code simplicity review

**Affected Files:**
- `packages/features/auth/hooks/_lib/use-mounted-ref.ts` (the hook itself)
- `packages/features/auth/hooks/use-password-sign-in.ts`
- `packages/features/auth/hooks/use-password-sign-up.ts`
- `packages/features/auth/hooks/use-magic-link-request.ts`
- `packages/features/auth/hooks/use-forgot-password.ts`
- `packages/features/auth/hooks/use-reset-password.ts`

**Details:**
- 5 hooks import and use `useMountedRef`
- Each has ~3 lines of dead defensive code (import + ref + guard)
- ~15-22 lines of unnecessary code total
- Note: todo #022 extracted this hook as a shared utility; this todo proposes removing it entirely

## Proposed Solutions

### Option A: Remove useMountedRef and all guards (Recommended)
- **Pros:** ~22 lines removed, eliminates obsolete pattern
- **Cons:** None — React 19 handles this natively
- **Effort:** Small
- **Risk:** None

## Acceptance Criteria

- [ ] `use-mounted-ref.ts` deleted
- [ ] All `isMountedRef.current` guards removed from auth hooks
- [ ] All hooks still function correctly after async operations
- [ ] Build passes

## Work Log

| Date | Action | Outcome |
|------|--------|---------|
| 2026-02-05 | Created from PR #103 simplicity review | Pending |
