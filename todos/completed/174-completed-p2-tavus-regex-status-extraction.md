---
status: completed
priority: p2
issue_id: "174"
tags: [code-review, architecture, tavus, mirror]
dependencies: []
---

# Replace Regex Status Extraction with TavusApiError Class

## Problem Statement

The route handler at `apps/mirror/app/api/tavus/conversations/route.ts` extracts the upstream HTTP status code from the error *message string* via regex:

```typescript
const statusMatch = message.match(/Tavus API error \((\d+)\)/);
const status = statusMatch ? Number(statusMatch[1]) : 500;
```

This creates stringly-typed coupling between the route handler in `apps/mirror` and the error message format produced by `packages/tavus/src/client.ts`. If anyone changes the message template — even cosmetically — the regex silently stops matching and all errors fall back to 500.

## Findings

- **Location:** `apps/mirror/app/api/tavus/conversations/route.ts:33-34` (consumer), `packages/tavus/src/client.ts:26` (producer)
- **Source:** Code review — flagged by all 4 review agents (security-sentinel, architecture-strategist, code-simplicity-reviewer, pattern-recognition-specialist)
- **Severity:** Medium
- **Pattern:** Stringly-typed programming / Dependency Inversion Principle violation
- **Precedent:** Codebase already uses custom error classes (e.g., `AuthenticationError` in `apps/greyboard/utils/require-user.ts`)

## Proposed Solutions

### Solution A: TavusApiError Custom Error Class (Recommended)

Add a custom error class to `packages/tavus/src/client.ts`:

```typescript
export class TavusApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
    this.name = "TavusApiError";
  }
}
```

Use `instanceof` in the route handler:

```typescript
const status = error instanceof TavusApiError ? error.status : 500;
```

- **Pros:** Type-safe, self-documenting, impossible to break via message changes, follows existing codebase patterns
- **Cons:** Adds one class (~6 lines)
- **Effort:** Small
- **Risk:** None

### Solution B: Keep Regex, Add Tests

Write integration tests that assert the error message format matches the regex.

- **Pros:** No code change needed
- **Cons:** Tests as documentation is weaker than types; still fragile coupling
- **Effort:** Small
- **Risk:** Low but still a maintenance burden

## Acceptance Criteria

- [ ] `TavusApiError` class exists in `packages/tavus/src/client.ts` and is exported
- [ ] `createConversation` throws `TavusApiError` with the upstream status code
- [ ] `endConversation` also throws `TavusApiError` for consistency (see #178)
- [ ] Route handler uses `instanceof TavusApiError` instead of regex
- [ ] No regex parsing of error message strings
- [ ] Build passes

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-19 | Created from code review of unstaged changes on mirror/fix-tavus-server-error | All 4 independent review agents converged on same recommendation |
| 2026-02-19 | Implemented TavusApiError class, updated route handler to use instanceof | Also applied to endConversation (#178) |
