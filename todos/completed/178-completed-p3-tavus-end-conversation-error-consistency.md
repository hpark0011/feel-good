---
status: completed
priority: p3
issue_id: "178"
tags: [code-review, quality, tavus]
dependencies: ["174"]
---

# Apply TavusApiError to endConversation for Consistency

## Problem Statement

`endConversation` in `packages/tavus/src/client.ts` throws a plain `Error` with the status code embedded in the message string:

```typescript
throw new Error(`Failed to end conversation: ${response.status}`);
```

This is the same stringly-typed pattern that `createConversation` had before the `TavusApiError` fix (#174). Any future route handler consuming `endConversation` errors would face the same regex-or-lose-status problem.

## Findings

- **Location:** `packages/tavus/src/client.ts:46`
- **Source:** Code review — architecture-strategist and pattern-recognition-specialist
- **Severity:** Low
- **Note:** No route handler currently consumes `endConversation` errors, but inconsistency invites future bugs

## Proposed Solutions

### Solution A: Use TavusApiError (Recommended)

```typescript
if (!response.ok) {
  throw new TavusApiError(response.status, `Failed to end conversation`);
}
```

- **Pros:** Consistent error handling across the package, status code always available structurally
- **Cons:** None
- **Effort:** Small (one-line change after #174)
- **Risk:** None

## Acceptance Criteria

- [ ] `endConversation` throws `TavusApiError` instead of plain `Error`
- [ ] Status code is carried as a property, not embedded in the message
- [ ] Build passes

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-19 | Created from code review of unstaged changes on mirror/fix-tavus-server-error | Consistency across the tavus package error handling |
| 2026-02-19 | Applied TavusApiError to endConversation alongside #174 fix | Done in same pass since the class was already added |
