---
title: Fix Social Icons Module Resolution
type: fix
date: 2026-02-02
---

# Fix Social Icons Module Resolution

## Overview

The import `@feel-good/icons/social/google` in `apps/ui-factory/app/blocks/login/_components/password-login-form.tsx` fails with TypeScript error TS2307: "Cannot find module or its corresponding type declarations."

## Problem Statement

Two issues prevent the social icons from being imported:

### Issue 1: Missing Dependency

`@feel-good/ui-factory` does not list `@feel-good/icons` as a dependency in its `package.json`. Without this, pnpm cannot resolve the package.

**Evidence:** `apps/ui-factory/package.json` only has:
- `@feel-good/ui` ✓
- `@feel-good/icons` ✗ (missing)

### Issue 2: Inconsistent Export Pattern

The `@feel-good/icons` package uses a different export pattern than the working `@feel-good/ui` package.

**Working pattern in `@feel-good/ui`:**
```json
"exports": {
  "./primitives/*": "./src/primitives/*.tsx"
}
```

**Current pattern in `@feel-good/icons`:**
```json
"exports": {
  "./social/google": {
    "types": "./src/social/google.tsx",
    "default": "./src/social/google.tsx"
  }
}
```

The explicit per-file exports with `types`/`default` conditions may not resolve correctly with `moduleResolution: "Bundler"` in this monorepo's TypeScript configuration.

## Proposed Solution

### Step 1: Add Missing Dependency

Add `@feel-good/icons` to `apps/ui-factory/package.json`:

```json
{
  "dependencies": {
    "@feel-good/icons": "workspace:*",
    "@feel-good/ui": "workspace:*",
    ...
  }
}
```

### Step 2: Fix Export Pattern

Update `packages/icons/package.json` to use the wildcard pattern that works in `@feel-good/ui`:

```json
{
  "exports": {
    ".": {
      "types": "./src/index.ts",
      "default": "./src/index.ts"
    },
    "./social/*": "./src/social/*.tsx"
  }
}
```

### Step 3: Run pnpm install

After modifying package.json files, run `pnpm install` from the monorepo root to update the lockfile and symlinks.

## Acceptance Criteria

- [x] `@feel-good/icons` added to ui-factory dependencies
- [x] Social icon exports use wildcard pattern matching @feel-good/ui
- [x] `pnpm install` runs successfully
- [x] TypeScript compiles without TS2307 error
- [x] Import `@feel-good/icons/social-icons/google` resolves correctly
- [ ] Dev server runs and displays the Google icon in the login form

## Files to Modify

| File | Change |
|------|--------|
| `apps/ui-factory/package.json` | Add `@feel-good/icons` dependency |
| `packages/icons/package.json` | Change explicit exports to wildcard pattern |

## Verification

```bash
# After changes
pnpm install
cd apps/ui-factory && npx tsc --noEmit
pnpm dev --filter=@feel-good/ui-factory
# Navigate to http://localhost:3002/blocks/login
```

## References

- Working pattern: `packages/ui/package.json:7-11`
- TypeScript config: `tooling/typescript/base.json` (uses `moduleResolution: "Bundler"`)
- Affected file: `apps/ui-factory/app/blocks/login/_components/password-login-form.tsx:1`
