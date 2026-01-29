# pnpm Workspace Catalog Implementation Plan

**Date:** 2026-01-29
**Status:** Draft
**Scope:** Feel Good Monorepo

## Overview

This plan outlines the implementation of [pnpm workspace catalog](https://pnpm.io/catalogs) to centralize dependency version management across the monorepo. The catalog feature allows defining dependency versions once in `pnpm-workspace.yaml` and referencing them via `catalog:` protocol in package.json files.

## Current State

### Workspace Structure
- **2 Apps:** greyboard, mirror (both Next.js 16)
- **5 Packages:** convex, features, icons, ui, utils
- **3 Tooling:** eslint, prettier, typescript configs
- **Total:** 11 workspace packages

### Pain Points
1. **Version drift:** `react-day-picker` is ^9.9.0 in greyboard but ^9.13.0 in ui
2. **Duplicate declarations:** 150+ duplicate dependency entries across packages
3. **Manual sync:** Version updates require editing multiple package.json files
4. **Lock file bloat:** Same dependency with different ranges creates extra entries

## Proposed Solution

### Catalog Organization

Organize the catalog into logical groups for maintainability:

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tooling/*"

catalogs:
  # Default catalog (accessed via catalog:)
  default:
    # React core
    react: "19.2.3"
    react-dom: "19.2.3"
    "@types/react": "^19"
    "@types/react-dom": "^19"

    # Next.js
    next: "16.1.4"

    # TypeScript & Build
    typescript: "^5.3.0"
    "@types/node": "^20"

    # Form & Validation
    zod: "^4.0.17"
    react-hook-form: "^7.62.0"
    "@hookform/resolvers": "^5.2.1"

    # UI utilities
    clsx: "^2.1.1"
    class-variance-authority: "^0.7.1"
    tailwind-merge: "^3.3.0"
    lucide-react: "^0.540.0"

    # Styling
    tailwindcss: "^4"
    "@tailwindcss/postcss": "^4"

    # Backend & Auth
    convex: "^1.25.0"
    better-auth: "1.4.9"
    "@convex-dev/better-auth": "^0.10.10"

  # Named catalog for Radix UI (accessed via catalog:radix)
  radix:
    "@radix-ui/react-accordion": "^1.2.12"
    "@radix-ui/react-alert-dialog": "^1.1.15"
    "@radix-ui/react-aspect-ratio": "^1.1.7"
    "@radix-ui/react-avatar": "^1.1.10"
    "@radix-ui/react-checkbox": "^1.3.3"
    "@radix-ui/react-collapsible": "^1.1.11"
    "@radix-ui/react-context-menu": "^2.2.15"
    "@radix-ui/react-dialog": "^1.1.14"
    "@radix-ui/react-dropdown-menu": "^2.1.15"
    "@radix-ui/react-hover-card": "^1.1.15"
    "@radix-ui/react-label": "^2.1.7"
    "@radix-ui/react-menubar": "^1.1.15"
    "@radix-ui/react-navigation-menu": "^1.2.13"
    "@radix-ui/react-popover": "^1.1.14"
    "@radix-ui/react-progress": "^1.1.7"
    "@radix-ui/react-radio-group": "^1.3.7"
    "@radix-ui/react-scroll-area": "^1.2.9"
    "@radix-ui/react-select": "^2.2.5"
    "@radix-ui/react-separator": "^1.1.7"
    "@radix-ui/react-slider": "^1.3.5"
    "@radix-ui/react-slot": "^1.2.3"
    "@radix-ui/react-switch": "^1.2.5"
    "@radix-ui/react-tabs": "^1.1.12"
    "@radix-ui/react-toast": "^1.2.14"
    "@radix-ui/react-toggle": "^1.1.9"
    "@radix-ui/react-toggle-group": "^1.1.10"
    "@radix-ui/react-tooltip": "^1.2.7"

  # Named catalog for charts & animations
  charts:
    recharts: "2.15.4"
    embla-carousel-react: "^8.6.0"
    react-resizable-panels: "^3.0.4"
```

### Usage Example

Before (current):
```json
{
  "dependencies": {
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "@radix-ui/react-dialog": "^1.1.14"
  }
}
```

After (with catalog):
```json
{
  "dependencies": {
    "react": "catalog:",
    "react-dom": "catalog:",
    "@radix-ui/react-dialog": "catalog:radix"
  }
}
```

## Implementation Steps

### Phase 1: Setup Catalog

1. **Update pnpm-workspace.yaml** with catalog definitions
2. **Verify pnpm version** supports catalogs (pnpm 9.5.0+)
3. **Update packageManager** in root package.json if needed

### Phase 2: Migrate Core Dependencies

Priority order based on usage frequency:

| Priority | Dependencies | Packages Affected |
|----------|-------------|-------------------|
| 1 | react, react-dom, @types/react, @types/react-dom | 7 packages |
| 2 | typescript, @types/node | 8 packages |
| 3 | next | 2 packages |
| 4 | zod, react-hook-form, @hookform/resolvers | 4 packages |
| 5 | All @radix-ui/* components | 2 packages |

### Phase 3: Migrate UI & Utility Dependencies

- clsx, class-variance-authority, tailwind-merge
- lucide-react, sonner, vaul
- date-fns, cmdk, input-otp
- embla-carousel-react, recharts
- framer-motion, react-day-picker

### Phase 4: Migrate Backend Dependencies

- convex, @convex-dev/*
- better-auth
- resend, @react-email/*

### Phase 5: Cleanup & Verification

1. Run `pnpm install` to regenerate lock file
2. Verify all packages resolve correctly
3. Run full build: `pnpm build`
4. Run tests: `pnpm lint`
5. Compare lock file size (expect 30-40% reduction)

## Files to Modify

### Configuration
- `pnpm-workspace.yaml` - Add catalogs section
- `package.json` (root) - Update packageManager version if needed

### Apps
- `apps/greyboard/package.json`
- `apps/mirror/package.json`

### Packages
- `packages/convex/package.json`
- `packages/features/package.json`
- `packages/icons/package.json`
- `packages/ui/package.json`
- `packages/utils/package.json`

### Tooling
- `tooling/eslint/package.json`
- `tooling/prettier/package.json`
- `tooling/typescript/package.json`

## Version Standardization

The following versions will be standardized during migration:

| Dependency | Current | Standardized |
|------------|---------|--------------|
| react-day-picker | ^9.9.0 / ^9.13.0 | ^9.13.0 |
| zod | ^4.0.0 / ^4.0.17 | ^4.0.17 |
| typescript | ^5 / ^5.3.0 | ^5.3.0 |

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking changes from version standardization | Medium | Run full test suite after each phase |
| Lock file conflicts during migration | Low | Complete migration in single PR |
| IDE/tooling not recognizing catalog: protocol | Low | Update VS Code pnpm extension |

## Success Criteria

- [ ] All 150+ duplicate dependency declarations reduced to single catalog entries
- [ ] Zero version drift between packages for shared dependencies
- [ ] Lock file size reduced by 30%+
- [ ] All packages build successfully
- [ ] Lint passes across all packages

## Timeline

| Phase | Estimated Effort |
|-------|------------------|
| Phase 1: Setup | Small |
| Phase 2: Core deps | Small |
| Phase 3: UI deps | Medium |
| Phase 4: Backend deps | Small |
| Phase 5: Verification | Small |

## References

- [pnpm Catalogs Documentation](https://pnpm.io/catalogs)
- [pnpm Workspace Protocol](https://pnpm.io/workspaces)
- [Turborepo with pnpm](https://turbo.build/repo/docs/guides/tools/pnpm)
