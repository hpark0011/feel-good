---
status: pending
priority: p3
issue_id: "177"
tags: [code-review, quality, tavus]
dependencies: ["174"]
---

# Update Stale TavusErrorResponse Type

## Problem Statement

The `TavusErrorResponse` type in `packages/tavus/src/types.ts` declares `error` and `message` as required strings, but:
1. The error parsing chain now also checks for `error.detail` — a field not in the type
2. The type is never used at runtime to constrain the parsed JSON (`.json()` returns untyped `any`)
3. The fields should be optional since Tavus responses are inconsistent

## Findings

- **Location:** `packages/tavus/src/types.ts:19-22`
- **Source:** Code review — code-simplicity-reviewer and pattern-recognition-specialist
- **Severity:** Low
- **Note:** The type is exported but never imported anywhere in the codebase

## Proposed Solutions

### Solution A: Update Type to Match Reality (Recommended)

```typescript
export type TavusErrorBody = {
  message?: string;
  error?: string;
  detail?: string;
};
```

Use this to type the parsed response in `client.ts`:

```typescript
const error: TavusErrorBody = await response
  .json()
  .catch(() => ({ message: "Unknown error" }));
```

- **Pros:** Documents the actual API shape, provides type safety
- **Cons:** Minor refactor
- **Effort:** Small
- **Risk:** None

### Solution B: Delete the Unused Type

If `TavusApiError` class (from #174) carries the structured body, the standalone type may be redundant.

- **Pros:** Less dead code
- **Cons:** Loses documentation value
- **Effort:** Small
- **Risk:** None

## Acceptance Criteria

- [ ] `TavusErrorResponse` type is either updated to reflect reality or removed
- [ ] If kept, it is used at runtime to type the parsed error body
- [ ] No untyped `.json()` calls in the tavus client

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-19 | Created from code review of unstaged changes on mirror/fix-tavus-server-error | Type exists but is never used at runtime |
