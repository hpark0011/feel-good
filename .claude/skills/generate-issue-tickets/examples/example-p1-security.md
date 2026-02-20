<!-- File location: workspace/tickets/to-do/FG_001-p1-unauthenticated-admin-api.md -->
---
id: FG_001
title: "Admin API routes reject unauthenticated requests"
date: 2026-02-20
type: fix
status: to-do
priority: p1
description: "The /api/admin/users route handler does not validate the caller's session or role before returning user data, allowing any unauthenticated request to access the full user list including emails."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "`grep -n 'isAuthenticated\\|getSession\\|auth' apps/mirror/app/api/admin/users/route.ts` returns at least one match (auth guard is present)"
  - "`apps/mirror/app/api/admin/users/route.ts` contains a 401 response — file includes `{ status: 401 }`"
  - "`grep -n 'NextResponse.json(users)' apps/mirror/app/api/admin/users/route.ts` — if present, it is inside a conditional block (not top-level)"
  - "`pnpm build --filter=@feel-good/mirror` exits 0"
  - "`pnpm tsc --noEmit --filter=@feel-good/mirror` exits 0"
owner_agent: "Auth Guard Security Agent"
---

# Admin API Routes Reject Unauthenticated Requests

## Context

The `/api/admin/users` route handler does not validate the caller's session or role before returning user data. Any unauthenticated request to `GET /api/admin/users` returns the full user list including emails. The route was added in PR #142 but the auth middleware was not wired up.

- **Source:** Code review of PR #142
- **Location:** `apps/mirror/app/api/admin/users/route.ts:5-12`
- **Evidence:** No call to `isAuthenticated()` or role check before `NextResponse.json(users)`. Confirmed via `curl localhost:3001/api/admin/users` returning 200 with user data.

## Goal

Admin API routes reject unauthenticated and non-admin callers with a 401 response. Only authenticated users with the admin role receive user data.

## Scope

- Add `isAuthenticated()` session check to the `/api/admin/users` route handler
- Add admin role verification before returning data
- Return 401 for unauthenticated or non-admin requests

## Out of Scope

- Adding rate limiting to admin routes (separate ticket)
- Auditing other API routes for similar issues (separate ticket)
- Adding admin role management UI

## Approach

Add `isAuthenticated()` check and verify admin role before returning data:

```typescript
const session = await getSession();
if (!session || session.role !== "admin") {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

- **Effort:** Small
- **Risk:** Low

## Constraints

- Must use the existing `getSession()` and `isAuthenticated()` helpers — do not introduce new auth utilities
- Must not change the response shape for authenticated admin callers

## Resources

- PR: https://github.com/hpark0011/feel-good/pull/142
