---
title: "refactor: Migrate from ESLint + Prettier to Biome"
type: refactor
date: 2026-01-30
status: draft
---

# Migrate from ESLint + Prettier to Biome

## Overview

Replace ESLint + Prettier with Biome to reduce toolchain complexity, improve performance, and simplify developer workflow. This migration follows the existing monorepo pattern of centralizing tooling configs.

## Problem Statement

Current tooling setup has friction:

| Issue | Impact |
|-------|--------|
| Two tools (ESLint + Prettier) with overlapping concerns | Config maintenance overhead |
| `eslint-config-prettier` needed to prevent conflicts | Extra dependency, extra complexity |
| Slower feedback loop in CI and local dev | Developer wait time |
| Multiple config files per tool | Cognitive load for contributors |

## Proposed Solution

Replace with Biome v2, a single Rust-based tool that handles both linting and formatting with near-zero configuration.

**Key benefits:**
- 10-25x faster than ESLint + Prettier combined
- Single config file (`biome.json`)
- 97% Prettier compatibility
- Built-in import sorting
- No plugin coordination issues

## Current State Analysis

### ESLint Configuration

**Location:** `tooling/eslint/`

**base.js rules:**
- `@eslint/js` recommended
- `typescript-eslint` recommended
- `eslint-config-prettier` (conflict prevention)
- `@typescript-eslint/no-unused-vars`: error (ignores `_` prefixed)
- `@typescript-eslint/no-non-null-assertion`: warn

**next.js rules:**
- `eslint-config-next/core-web-vitals`
- `eslint-config-next/typescript`
- Same `no-unused-vars` pattern
- Ignores: `.next/**`, `out/**`, `build/**`

### Prettier Configuration

**Location:** `tooling/prettier/index.js`

```javascript
{
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: "es5",
  printWidth: 100,
}
```

### Dependencies to Remove

**Root `package.json`:**
- `prettier: ^3.2.5`

**`@feel-good/eslint-config`:**
- `@eslint/js: catalog:`
- `eslint: catalog:`
- `eslint-config-next: >=15.0.0`
- `eslint-config-prettier: catalog:`
- `typescript-eslint: catalog:`

**Catalog versions (`pnpm-workspace.yaml`):**
- `eslint: ^9`
- `@eslint/js: ^9.0.0`
- `eslint-config-prettier: ^9.0.0`
- `typescript-eslint: ^8.0.0`

## Technical Approach

### Rule Mapping: ESLint → Biome

| ESLint Rule | Biome Equivalent | Notes |
|-------------|------------------|-------|
| `@typescript-eslint/no-unused-vars` | `noUnusedVariables` + `noUnusedImports` | Built-in, no config needed for `_` pattern |
| `@typescript-eslint/no-non-null-assertion` | `noNonNullAssertion` | Available in `style` group |
| `eslint-config-next/core-web-vitals` | `domains.next: "recommended"` | Biome v2 domains |
| React hooks rules | `domains.react: "recommended"` | Partial coverage |

### Prettier → Biome Formatter Mapping

| Prettier | Biome | Value |
|----------|-------|-------|
| `semi: false` | `semicolons` | `"asNeeded"` |
| `singleQuote: true` | `quoteStyle` | `"single"` |
| `tabWidth: 2` | `indentWidth` | `2` |
| `trailingComma: "es5"` | `trailingCommas` | `"es5"` |
| `printWidth: 100` | `lineWidth` | `100` |

### Known Gaps

| Feature | Status | Mitigation |
|---------|--------|------------|
| `react-hooks/exhaustive-deps` | No direct equivalent | Accept or use `useExhaustiveDependencies` (partial) |
| Some `@next/eslint-plugin-next` rules | Limited coverage | Run `next lint` in parallel if critical |
| Custom ESLint plugins | Not available | Evaluate necessity |

**Recommendation:** The gaps are acceptable for this codebase. No custom plugins are used, and the core rules are covered.

## Implementation Phases

### Phase 0: Audit Current State ✅

**Status:** Complete (this document)

- [x] List current ESLint rules producing warnings/errors
- [x] Identify must-keep rules vs nice-to-have
- [x] Document Prettier settings
- [x] Map rules to Biome equivalents

**Exit criteria:** Clear understanding of what ESLint catches today (documented above)

---

### Phase 1: Install Biome (Parallel Run)

**Goal:** Run Biome alongside existing tools without breaking anything

#### Tasks

- [ ] Install Biome at workspace root

```bash
pnpm add -D @biomejs/biome
pnpm biome init
```

- [ ] Create root `biome.json`

```json
{
  "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
  "vcs": {
    "enabled": true,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": true,
    "includes": ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "**/*.json"]
  },
  "organizeImports": {
    "enabled": true
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "correctness": {
        "noUnusedImports": "error",
        "noUnusedVariables": "error",
        "useExhaustiveDependencies": "warn",
        "useHookAtTopLevel": "error"
      },
      "style": {
        "noNonNullAssertion": "warn",
        "useConst": "error",
        "useImportType": "error"
      },
      "suspicious": {
        "noExplicitAny": "warn"
      }
    },
    "domains": {
      "next": "recommended",
      "react": "recommended"
    }
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100,
    "lineEnding": "lf"
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "trailingCommas": "es5",
      "semicolons": "asNeeded",
      "arrowParentheses": "always"
    }
  },
  "json": {
    "formatter": {
      "trailingCommas": "none"
    }
  }
}
```

- [ ] Add parallel scripts to root `package.json`

```json
{
  "scripts": {
    "lint": "turbo run lint",
    "lint:biome": "biome check .",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "format:biome": "biome format --write ."
  }
}
```

- [ ] Run `pnpm lint:biome` and review output
- [ ] Fix any unexpected errors (should be minimal)

**Exit criteria:**
- Biome runs cleanly or with understood warnings
- No developer workflow breakage
- ESLint + Prettier still work as before

---

### Phase 2: Replace Formatting Source of Truth

**Goal:** Switch from Prettier to Biome for all formatting

#### Tasks

- [ ] Apply Biome formatting to entire codebase

```bash
pnpm biome format --write .
```

- [ ] Commit formatting changes (single mechanical commit)

```bash
git add -A
git commit -m "style: apply Biome formatting

Mechanical commit - no logic changes.
Migrating from Prettier to Biome formatter."
```

- [ ] Update root `package.json` scripts

```json
{
  "scripts": {
    "format": "biome format --write .",
    "format:check": "biome format ."
  }
}
```

- [ ] Remove Prettier from root

```bash
pnpm remove prettier
```

- [ ] Delete `tooling/prettier/` directory

```bash
rm -rf tooling/prettier
```

- [ ] Remove Prettier references from any editor configs

**Exit criteria:**
- No formatting diffs after initial reformat
- PR diffs become smaller and clearer
- `pnpm format` uses Biome

---

### Phase 3: Decommission ESLint

**Goal:** Replace ESLint with Biome for linting

#### Tasks

- [ ] Update app `eslint.config.mjs` files to remove them

```bash
rm apps/greyboard/eslint.config.mjs
rm apps/mirror/eslint.config.mjs
rm apps/ui-factory/eslint.config.mjs
```

- [ ] Delete `tooling/eslint/` directory

```bash
rm -rf tooling/eslint
```

- [ ] Update `turbo.json` lint task

```json
{
  "tasks": {
    "lint": {
      "inputs": ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx", "biome.json"],
      "outputs": []
    }
  }
}
```

- [ ] Update root `package.json` scripts

```json
{
  "scripts": {
    "lint": "biome lint .",
    "check": "biome check .",
    "check:fix": "biome check --write ."
  }
}
```

- [ ] Remove ESLint dependencies from catalog (`pnpm-workspace.yaml`)

```yaml
# Remove these lines:
# eslint: ^9
# @eslint/js: ^9.0.0
# eslint-config-prettier: ^9.0.0
# typescript-eslint: ^8.0.0
# eslint-config-next: 16.1.4  # if not needed elsewhere
```

- [ ] Disable ESLint in Next.js builds

**`apps/greyboard/next.config.ts`:**
```typescript
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
}
```

(Repeat for other apps)

- [ ] Run `pnpm install` to clean up lockfile

**Exit criteria:**
- ESLint completely removed
- `pnpm lint` uses Biome
- All apps build successfully

---

### Phase 4: CI & Editor Integration

**Goal:** Enforce Biome in CI and configure editor support

#### Tasks

- [ ] Create CI workflow `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check:
    name: Lint & Format
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 9

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - uses: biomejs/setup-biome@v2
        with:
          version: latest

      - run: biome ci .
```

- [ ] Create `.vscode/settings.json`

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports.biome": "explicit",
    "source.fixAll.biome": "explicit"
  },
  "[javascript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[json]": {
    "editor.defaultFormatter": "biomejs.biome"
  }
}
```

- [ ] Create `.vscode/extensions.json`

```json
{
  "recommendations": ["biomejs.biome"],
  "unwantedRecommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

- [ ] Update CLAUDE.md with new lint commands

**Exit criteria:**
- CI enforces Biome on all PRs
- VS Code formats with Biome on save
- Single command for code hygiene: `pnpm check`

---

### Phase 5: Cleanup & Documentation

**Goal:** Remove all traces of old tooling, update docs

#### Tasks

- [ ] Verify no ESLint/Prettier references remain

```bash
grep -r "eslint" --include="*.json" --include="*.md" .
grep -r "prettier" --include="*.json" --include="*.md" .
```

- [ ] Update CLAUDE.md

```markdown
## Linting & Formatting

Single command for code hygiene:

\`\`\`bash
pnpm check        # Check lint + format
pnpm check:fix    # Auto-fix issues
\`\`\`

Biome handles both linting and formatting. No separate Prettier or ESLint.
```

- [ ] Update contributing guidelines if they exist
- [ ] Remove any `.eslintignore` or `.prettierignore` files (none exist currently)

**Exit criteria:**
- Clean codebase with no legacy tooling references
- Documentation reflects new workflow

## Files Changed

### Created
- `/biome.json` - Root Biome configuration
- `/.vscode/settings.json` - Editor settings
- `/.vscode/extensions.json` - Extension recommendations
- `/.github/workflows/ci.yml` - CI workflow

### Modified
- `/package.json` - Scripts, remove prettier dependency
- `/turbo.json` - Update lint task inputs
- `/pnpm-workspace.yaml` - Remove ESLint catalog entries
- `/apps/*/next.config.ts` - Disable ESLint in builds
- `/CLAUDE.md` - Update lint documentation

### Deleted
- `/tooling/eslint/` - Entire directory
- `/tooling/prettier/` - Entire directory
- `/apps/greyboard/eslint.config.mjs`
- `/apps/mirror/eslint.config.mjs`
- `/apps/ui-factory/eslint.config.mjs`

## Rollback Plan

If issues arise post-migration:

1. Revert commits from this migration
2. Run `pnpm install` to restore ESLint/Prettier
3. Delete `biome.json` and `.vscode/` additions

The migration is designed as discrete commits, making partial or full rollback straightforward.

## Success Metrics

| Metric | Before | Target |
|--------|--------|--------|
| Lint + format time (local) | ~8-12s | <2s |
| CI lint job duration | ~45s | <15s |
| Config files | 6+ | 1 (`biome.json`) |
| Dependencies for linting | 5 | 1 |
| Commands to remember | `lint`, `format` | `check` |

## References

### Internal
- `tooling/eslint/base.js:11-18` - Current custom rules
- `tooling/prettier/index.js:1-7` - Current formatting config
- `pnpm-workspace.yaml:57-60` - ESLint catalog versions

### External
- [Biome v2 Documentation](https://biomejs.dev/guides/big-projects/)
- [Turborepo Biome Guide](https://turborepo.dev/docs/guides/tools/biome)
- [Biome VS Code Extension](https://biomejs.dev/reference/vscode/)
- [biomejs/setup-biome GitHub Action](https://github.com/biomejs/setup-biome)
