---
status: pending
priority: p1
issue_id: "173"
tags: [code-review, security, video-call, mirror, tavus]
dependencies: []
---

# Unauthenticated API Route Allows Unauthorized Tavus Usage

## Problem Statement

The `/api/tavus/conversations` POST route has no authentication check. The existing middleware explicitly passes through all `/api/` routes (`pathname.startsWith("/api/")` -> `NextResponse.next()`). Any unauthenticated user can call this endpoint to create Tavus conversations, consuming paid API credits with no rate limiting or access control.

## Findings

- **Location:** `apps/mirror/app/api/tavus/conversations/route.ts:9-48`
- **Source:** PR #133 review (cursor[bot], comment id 2815369840)
- **Severity:** High
- **Note:** The plan (docs/plans/2026-02-17-feat-tavus-cvi-video-calling-plan.md) explicitly deferred auth for v1, relying on `max_duration` (10 min) as the only cost control. This review flags it as insufficient.

## Proposed Solutions

Add session validation to the API route before creating a Tavus conversation:

```typescript
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ... existing logic
}
```

Consider also adding rate limiting per user/IP.

- **Effort:** Low (auth check), Medium (rate limiting)

## Acceptance Criteria

- [ ] Unauthenticated requests to `/api/tavus/conversations` return 401
- [ ] Authenticated users can still create conversations
- [ ] Consider rate limiting to prevent abuse

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-17 | Created from PR #133 code review | Plan deferred auth but reviewer flags cost risk |
