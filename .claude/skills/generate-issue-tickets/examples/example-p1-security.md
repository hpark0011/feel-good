<!-- File location: workspace/tickets/backlog/001-p1-unauthenticated-admin-api.md -->
---
status: backlog
priority: p1
issue_id: "001"
tags: [bug, security, auth, mirror]
dependencies: []
---

# Unauthenticated Access to Admin API Route

## Problem Statement

The `/api/admin/users` route handler does not validate the caller's session or role before returning user data. Any unauthenticated request to `GET /api/admin/users` returns the full user list including emails. The route was added in PR #142 but the auth middleware was not wired up.

## Findings

- **Source:** Code review of PR #142
- **Location:** `apps/mirror/app/api/admin/users/route.ts:5-12`
- **Evidence:** No call to `isAuthenticated()` or role check before `NextResponse.json(users)`. Confirmed via `curl localhost:3001/api/admin/users` returning 200 with user data.

## Proposed Solutions

### Option A: Add auth + role guard (Recommended)

Add `isAuthenticated()` check and verify admin role before returning data:
```typescript
const session = await getSession();
if (!session || session.role !== "admin") {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

- **Effort:** Small
- **Risk:** Low

### Option B: Remove the route entirely

If the admin UI isn't ready, delete the route until it's needed.

- **Effort:** Small
- **Risk:** Low (but delays admin feature)

## Hard Validations

- [ ] **Grep:** `grep -n "isAuthenticated\|getSession\|auth" apps/mirror/app/api/admin/users/route.ts` → returns at least one match (auth guard is present)
- [ ] **Pattern match:** `apps/mirror/app/api/admin/users/route.ts` contains a 401 response before any data return → file includes `status: 401` or `{ status: 401 }`
- [ ] **Grep-absence:** `grep -n "NextResponse.json(users)" apps/mirror/app/api/admin/users/route.ts` → if present, it is inside a conditional block (not top-level)
- [ ] **Build:** `pnpm build --filter=@feel-good/mirror` → exits 0
- [ ] **Type check:** `pnpm tsc --noEmit --filter=@feel-good/mirror` → exits 0

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-20 | Created from code review of PR #142 | Always add auth guards when creating API routes |

## Resources

- PR: https://github.com/hpark0011/feel-good/pull/142
