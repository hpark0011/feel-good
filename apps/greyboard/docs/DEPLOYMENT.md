# Deployment Guide

## Vercel Configuration

### Environment Variables

**Do NOT manually set these in Vercel:**

| Variable | Why Not |
|----------|---------|
| `NODE_ENV` | Vercel handles this automatically. Setting it manually causes `devDependencies` to be skipped during install, breaking builds that need TypeScript. |

## Debugging Deployment Failures

When a Vercel build fails, follow this process in order:

### 1. Search the exact error message first

Before theorizing, search the web for the exact error. Platform-specific errors (Vercel, pnpm, Next.js) often have documented solutions.

Example: `ERR_PNPM_INCLUDED_DEPS_CONFLICT` → Known issue with `NODE_ENV=production` in env vars.

### 2. Ask "what changed?"

Compare the last working deployment to the failing one:
- What code changed?
- What dependencies changed?
- What environment configuration changed?

### 3. Check environment before code

Deployment failures often stem from environment configuration, not code:
- [ ] Check Vercel environment variables
- [ ] Check build settings
- [ ] Check Node.js version

### 4. Don't apply workarounds before understanding root cause

Workarounds (like changing file extensions, moving dependencies) can mask the real problem or create new ones. Understand the cause first.

### 5. Check Vercel/Next.js GitHub issues

Many deployment issues are known bugs with documented solutions:
- [Next.js Issues](https://github.com/vercel/next.js/issues)
- [Vercel Community](https://community.vercel.com/)

## Common Issues

### `ERR_PNPM_INCLUDED_DEPS_CONFLICT` during build

**Error:**
```
ERR_PNPM_INCLUDED_DEPS_CONFLICT modules directory was installed with optionalDependencies, dependencies. Current install wants optionalDependencies, dependencies, devDependencies.
```

**Cause:** `NODE_ENV=production` is set in Vercel environment variables, causing pnpm to skip `devDependencies` (including TypeScript needed for `next.config.ts`).

**Solution:** Remove `NODE_ENV` from Vercel project environment variables.

**Reference:** [Next.js Issue #81798](https://github.com/vercel/next.js/issues/81798)

### Build cache masking issues

When removing dependencies, the build cache may be invalidated, surfacing previously hidden issues.

**Solution:**
1. Check if `NODE_ENV` is manually set
2. Clear Vercel build cache (Settings → General → Build Cache → Clear)
3. Verify all build-time dependencies are available

## Pre-Deployment Checklist

- [ ] `pnpm --filter=@feel-good/greyboard check-types` passes
- [ ] `pnpm --filter=@feel-good/greyboard build` succeeds locally
- [ ] No `NODE_ENV` in Vercel environment variables
- [ ] Lockfile is committed and up to date
