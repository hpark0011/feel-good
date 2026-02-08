---
status: pending
priority: p2
issue_id: "083"
tags: [code-review, security, auth, mirror]
dependencies: []
---

# Server-Side Auth Guard Missing in Protected Layout

## Problem Statement

The `(protected)/layout.tsx` relies exclusively on middleware cookie-existence checks for auth enforcement. The middleware uses `getSessionCookie(request)` which checks whether a session cookie *exists* but does not validate whether the session is still active/not revoked. A user with an expired session cookie could reach protected routes until the cookie clears.

The `useSession()` call in `dashboard/page.tsx` is client-side only and doesn't redirect on auth failure.

## Findings

- **Source:** security-sentinel agent
- **Location:** `apps/mirror/app/(protected)/layout.tsx`
- **Evidence:** Layout is a simple pass-through with no server-side auth check. Middleware at `apps/mirror/middleware.ts` line 16 uses `getSessionCookie(request)` (cookie existence only).
- **Existing utility:** `isAuthenticated()` from `@/lib/auth-server` exists but is not used in the layout.

## Proposed Solutions

### Option A: Add server-side auth check in layout (Recommended)
```typescript
import { isAuthenticated } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }) {
  const authed = await isAuthenticated();
  if (!authed) redirect("/sign-in");
  return (<><DashboardHeader />{children}</>);
}
```
- **Pros:** Defense-in-depth, uses existing utility, minimal code
- **Cons:** Adds a server call per navigation
- **Effort:** Small
- **Risk:** Low

### Option B: Accept middleware-only protection
- **Pros:** No code change needed
- **Cons:** Expired/revoked sessions can access protected pages
- **Effort:** None
- **Risk:** Medium

## Recommended Action

Option A -- add server-side auth validation.

## Technical Details

- **Affected files:** `apps/mirror/app/(protected)/layout.tsx`
- **Components:** ProtectedLayout
- **Database changes:** None

## Acceptance Criteria

- [ ] Protected layout validates session server-side
- [ ] Expired/revoked sessions redirect to sign-in
- [ ] `isAuthenticated()` is called before rendering children

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-08 | Created from PR #105 code review | Middleware cookie checks are insufficient for session validity |

## Resources

- PR: https://github.com/hpark0011/feel-good/pull/105
- File: `apps/mirror/app/(protected)/layout.tsx`
