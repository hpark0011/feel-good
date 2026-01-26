# Deployment Guide

## Vercel Configuration

### Environment Variables

**Do NOT set these in Vercel:**
- `NODE_ENV` - Vercel handles this automatically. Setting it manually causes `devDependencies` to be skipped during install, which breaks builds that need TypeScript.

### Common Issues

#### `ERR_PNPM_INCLUDED_DEPS_CONFLICT` during build

**Symptom:** Build fails with message about TypeScript not found while loading `next.config.ts`

**Cause:** `NODE_ENV=production` is set in Vercel environment variables, causing pnpm to skip `devDependencies`

**Solution:** Remove `NODE_ENV` from Vercel project environment variables. Vercel manages this automatically.

#### Build cache masking issues

When removing dependencies, the build cache may be invalidated, surfacing previously hidden issues. If builds fail after dependency changes:

1. Check if `NODE_ENV` is manually set
2. Try clearing Vercel build cache (Settings → General → Build Cache → Clear)
3. Verify all build-time dependencies are available

### Configuration Files

- `next.config.ts` - Requires TypeScript to parse. If TypeScript issues occur, consider converting to `next.config.js`

## Pre-Deployment Checklist

- [ ] `pnpm --filter=@feel-good/greyboard check-types` passes
- [ ] `pnpm --filter=@feel-good/greyboard build` succeeds locally
- [ ] No `NODE_ENV` in Vercel environment variables
