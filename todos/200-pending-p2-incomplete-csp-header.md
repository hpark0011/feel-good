---
status: pending
priority: p2
issue_id: "200"
tags: [code-review, pr-124, security, csp, mirror]
dependencies: []
---

# Incomplete Content Security Policy header

## Problem Statement

The Mirror app's CSP header in `next.config.ts` only defines `img-src`. It is missing `default-src`, `script-src`, `style-src`, `connect-src`, and other directives. Without a `default-src` fallback, the browser applies no restrictions to resource types not explicitly listed, weakening the security posture.

## Findings

- **Location:** `apps/mirror/next.config.ts:9-11`
- Current CSP: `img-src 'self' https: data:;`
- Missing directives: `default-src`, `script-src`, `style-src`, `connect-src`, `font-src`, `frame-ancestors`
- The `data:` scheme in `img-src` is necessary for Tiptap/ProseMirror inline images but should be documented

## Proposed Solutions

### Option A: Add comprehensive CSP (Recommended)

Add a full CSP policy that starts restrictive and explicitly allows known origins:

```typescript
const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires these in dev
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https: data:",
  "font-src 'self'",
  "connect-src 'self' https://*.convex.cloud",
  "frame-ancestors 'none'",
].join("; ");
```

- **Effort:** Small
- **Risk:** Low — may need iteration to allow all required origins

### Option B: Use next-safe middleware

Use the `next-safe` package for automatic CSP generation.

- **Effort:** Medium
- **Risk:** Low — adds a dependency

## Acceptance Criteria

- [ ] CSP header includes `default-src 'self'` as baseline
- [ ] All resource types used by the app are explicitly allowed
- [ ] Dev mode still works (Next.js requires `unsafe-inline`/`unsafe-eval` for HMR)
- [ ] Production build serves pages without CSP violations

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-13 | Created from PR #124 security review | A partial CSP with only `img-src` provides minimal protection |
