---
status: pending
priority: p2
issue_id: "021"
tags: [code-review, architecture, auth]
dependencies: []
---

# AuthProvider Context Underutilized

## Problem Statement

The AuthProvider context exists but is not integrated into the main auth flow. Hooks require explicit `authClient` parameter, and Forms throw errors instead of falling back to context. This dual approach (props vs context) adds complexity without providing the ergonomic benefit of optional prop injection.

## Findings

**Source Agent:** architecture-strategist

**Affected Files:**
- `packages/features/auth/providers/auth-provider.tsx` (50 LOC)
- `packages/features/auth/hooks/use-password-sign-in.ts` (and all other hooks)
- `packages/features/auth/components/forms/password-login-form.tsx` (and all other forms)

**Current behavior:**
1. Hooks require explicit `authClient` parameter:
```typescript
export function usePasswordSignIn(
  authClient: AuthClient,  // Always required
  options: UsePasswordSignInOptions = {}
)
```

2. Forms throw error instead of context fallback:
```typescript
if (!authClient) {
  throw new Error("PasswordLoginForm requires authClient in production mode");
}
```

3. AuthProvider exists but cannot be used:
```typescript
export function AuthProvider({ children, baseURL }: AuthProviderProps) {
  const client = getAuthClient(baseURL);
  return (
    <AuthClientContext.Provider value={client}>
      {children}
    </AuthClientContext.Provider>
  );
}
```

## Proposed Solutions

### Option A: Integrate context fallback in Forms (Recommended)
```typescript
// In forms, fallback to context when prop not provided
const contextClient = useAuthClient(); // from context
const client = authClient ?? contextClient;
```
- **Pros:** Makes AuthProvider useful, cleaner API for consumers
- **Cons:** Requires wrapping app in AuthProvider
- **Effort:** Medium
- **Risk:** Low

### Option B: Remove AuthProvider entirely
- **Pros:** Simpler codebase, one pattern to understand
- **Cons:** Loses flexibility for future use
- **Effort:** Small
- **Risk:** Low

### Option C: Document intended usage clearly
- **Pros:** No code changes
- **Cons:** Doesn't resolve the architectural confusion
- **Effort:** Small
- **Risk:** None

## Recommended Action

Option A or B - Either fully commit to context or remove it. The current state is confusing.

## Technical Details

**Affected Files:**
- `packages/features/auth/providers/auth-provider.tsx`
- All form components in `packages/features/auth/components/forms/`
- `packages/features/auth/hooks/index.ts` (re-exports useAuthClient)

## Acceptance Criteria

- [ ] AuthProvider is either fully integrated or removed
- [ ] Documentation clearly explains when to use context vs props
- [ ] No dual patterns causing confusion

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-03 | Created from code review | Architecture strategist noted underutilization |

## Resources

- Commit: 72235497
- Branch: feel-good/020326-auth_ui_package
