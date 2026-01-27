---
title: "Vercel pnpm ERR_PNPM_INCLUDED_DEPS_CONFLICT with next.config.ts"
slug: vercel-pnpm-devdependencies-conflict
category: build-errors
tags:
  - vercel
  - pnpm
  - typescript
  - next.js
  - devDependencies
  - NODE_ENV
  - monorepo
  - turborepo
severity: high
symptoms:
  - "ERR_PNPM_INCLUDED_DEPS_CONFLICT error during Vercel build"
  - "modules directory was installed with optionalDependencies, dependencies. Current install wants optionalDependencies, dependencies, devDependencies"
  - "TypeScript not found while loading next.config.ts"
  - "Build worked locally but fails on Vercel"
  - "Build suddenly fails after dependency changes"
root_cause: "NODE_ENV=production manually set in Vercel environment variables causes pnpm to skip devDependencies during install"
resolution_time_saved: "2-4 hours"
created_date: 2026-01-27
references:
  - https://github.com/vercel/next.js/issues/81798
  - https://vercel.com/kb/guide/dependencies-from-package-json-missing-after-install
  - https://github.com/pnpm/pnpm/issues/6254
---

# Vercel Build Failure: ERR_PNPM_INCLUDED_DEPS_CONFLICT

## Problem Statement

Vercel build fails with:

```
ERR_PNPM_INCLUDED_DEPS_CONFLICT modules directory was installed with
optionalDependencies, dependencies. Current install wants
optionalDependencies, dependencies, devDependencies.
```

Followed by:

```
⚠ Installing TypeScript as it was not found while loading "next.config.ts"
Failed to install TypeScript, please install it manually
```

## Root Cause

**`NODE_ENV=production` was manually set in Vercel environment variables.**

When `NODE_ENV=production` is set during the install phase:
1. pnpm runs in production mode, skipping `devDependencies`
2. TypeScript (in `devDependencies`) is not installed
3. Next.js cannot parse `next.config.ts` without TypeScript
4. Next.js tries to auto-install TypeScript, but pnpm fails with the conflict error

### Why It Surfaced Now

The issue was hidden by Vercel's build cache. When we removed `@svgr/webpack` from dependencies, the lockfile changed significantly, invalidating the cached `node_modules`. The fresh install exposed the underlying misconfiguration.

**Key insight:** A working cached build doesn't mean the configuration is correct.

## Solution

**Remove `NODE_ENV` from Vercel environment variables.**

Vercel automatically sets `NODE_ENV` at the appropriate phases:
- Install phase: `NODE_ENV` is unset (all dependencies install)
- Build phase: `NODE_ENV=production`
- Runtime: `NODE_ENV=production`

### Steps

1. Go to Vercel Dashboard → Project → **Settings** → **Environment Variables**
2. Find `NODE_ENV` and **delete it**
3. Trigger a new deployment

## Verification

```bash
# Local verification
pnpm --filter=@feel-good/greyboard check-types
pnpm --filter=@feel-good/greyboard build
```

On Vercel, the build log should show all dependencies installing (not just production deps).

---

## Debugging Journey

This section documents the actual debugging path taken, including incorrect attempts, to improve future debugging.

### Timeline

| Step | Action | Result | Learning |
|------|--------|--------|----------|
| 1 | Suggested clearing build cache | Not root cause | Cache was symptom, not cause |
| 2 | Tried `next.config.mjs` | New error: `@/` imports broken | Workaround created new problem |
| 3 | Reverted to `next.config.ts` | Same original error | Back to square one |
| 4 | Considered `next.config.js` | Would have worked | But still a workaround |
| 5 | **Asked "how was it possible before?"** | Shifted thinking | Key debugging question |
| 6 | **Searched exact error message** | Found known issue | Should have done this first |
| 7 | Checked Vercel env vars | Found `NODE_ENV=production` | Root cause identified |

### What Went Wrong

1. **Didn't search the error immediately** - `ERR_PNPM_INCLUDED_DEPS_CONFLICT` is specific and searchable
2. **Proposed workarounds before understanding cause** - File format changes masked the real issue
3. **Didn't ask about environment early** - Focused on code, not configuration
4. **User had to prompt better debugging** - "How was it possible before?" unlocked the solution

### Correct Debugging Process

```
1. SEARCH FIRST: Copy exact error message → Search web
2. ASK "WHAT CHANGED?": Code AND environment
3. CHECK ENVIRONMENT: Vercel settings, env vars, build config
4. THEN CHECK CODE: Only after ruling out environment
5. NO PREMATURE WORKAROUNDS: Understand cause before fixing
```

---

## Prevention

### Environment Variables: What NOT to Set

| Variable | Why Not |
|----------|---------|
| `NODE_ENV` | Vercel manages automatically |
| `VERCEL` | Always set to "1" by Vercel |
| `VERCEL_ENV` | Set automatically per environment |

### Pre-Deployment Checklist

- [ ] `pnpm build` succeeds locally
- [ ] `NODE_ENV` is NOT in Vercel environment variables
- [ ] Lockfile is committed
- [ ] No phantom dependencies

### Debugging Checklist (On Failure)

1. [ ] Search exact error message first
2. [ ] Check Vercel environment variables
3. [ ] Compare working vs failing deployment settings
4. [ ] Ask "what changed?" (code AND environment)
5. [ ] Don't apply workarounds before understanding cause

---

## References

- [Next.js Issue #81798](https://github.com/vercel/next.js/issues/81798) - TypeScript should be in dependencies for next.config.ts
- [Vercel KB: Dependencies missing after install](https://vercel.com/kb/guide/dependencies-from-package-json-missing-after-install)
- [pnpm Issue #6254](https://github.com/pnpm/pnpm/issues/6254) - No option to install all dependencies ignoring NODE_ENV

## Related Documentation

- [DEPLOYMENT.md](../../DEPLOYMENT.md) - Full deployment guide with pre-flight checklist
