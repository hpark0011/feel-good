---
status: completed
priority: p2
issue_id: "175"
tags: [code-review, security, tavus, mirror]
dependencies: ["174"]
---

# Sanitize Upstream Error Messages Before Sending to Client

## Problem Statement

The route handler at `apps/mirror/app/api/tavus/conversations/route.ts` forwards the full upstream error message to the browser client:

```typescript
return NextResponse.json({ error: message }, { status });
```

The error message includes the upstream vendor name and status code (e.g., `"Tavus API error (429): Rate limit exceeded"`), which:
- Leaks backend architecture details (reveals Tavus as the upstream provider)
- Exposes the exact upstream status code to attackers probing the endpoint
- Could contain internal server details, persona IDs, or validation messages from Tavus

## Findings

- **Location:** `apps/mirror/app/api/tavus/conversations/route.ts:35`
- **Source:** Code review — security-sentinel agent
- **Severity:** Medium
- **Note:** Combined with the unauthenticated route (#173), an anonymous attacker can probe error responses freely

## Proposed Solutions

### Solution A: Generic Client Messages with Server-Side Logging (Recommended)

```typescript
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  console.error("[tavus/conversations]", message);

  if (error instanceof TavusApiError) {
    const clientStatus = error.status === 429 ? 429 : 500;
    const clientMessage = error.status === 429
      ? "Too many requests. Please try again later."
      : "Failed to start conversation";
    return NextResponse.json({ error: clientMessage }, { status: clientStatus });
  }
  return NextResponse.json({ error: "Failed to start conversation" }, { status: 500 });
}
```

- **Pros:** No vendor/architecture leak, actionable 429 message for users, full error logged server-side
- **Cons:** Harder to debug client-side without server logs
- **Effort:** Small
- **Risk:** None

### Solution B: Status Code Allowlist Only

Map upstream status to a small allowlist (400, 429, 500) but still return generic messages.

- **Pros:** Simpler mapping logic
- **Cons:** Still needs generic messages anyway
- **Effort:** Small
- **Risk:** None

## Acceptance Criteria

- [ ] Client never sees raw Tavus error messages
- [ ] Client never sees the string "Tavus" in error responses
- [ ] 429 rate limit errors are surfaced to the user with a helpful message
- [ ] Full error details are logged server-side for debugging
- [ ] Build passes

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-19 | Created from code review of unstaged changes on mirror/fix-tavus-server-error | Security sentinel flagged information disclosure |
| 2026-02-19 | Route handler now returns generic "Failed to start conversation" to client, logs full error server-side | 429 rate limit gets its own user-friendly message |
