---
title: feat: Share UI Factory CSS Across Monorepo
type: feat
date: 2026-02-02
---

# Share UI Factory CSS Across Monorepo

## Overview

Move CSS styles from `apps/ui-factory/styles/` into `packages/ui/src/styles/` so all monorepo apps can import shared styles via `@feel-good/ui/styles.css`.

## Problem Statement

Currently, `apps/ui-factory/styles/` contains 8 CSS files defining design tokens and component styles. These cannot be imported by other apps (greyboard, mirror). The `@feel-good/ui` package documents `import "@feel-good/ui/styles.css"` but this export doesn't exist.

## Proposed Solution

Create a shared styles directory in `packages/ui/` and add package.json exports for CSS files.

## Files to Modify

### 1. Create `packages/ui/src/styles/` directory

Copy from `apps/ui-factory/styles/`:
- `globals.css` (main entry point)
- `fonts.css`
- `radix-color-scale.css`
- `shadows.css`
- `sidebar.css`
- `input.css`
- `switch.css`
- `field.css`

### 2. Update `packages/ui/package.json`

Add CSS exports:

```json
{
  "exports": {
    "./primitives/*": "./src/primitives/*.tsx",
    "./components/*": "./src/components/*.tsx",
    "./providers/*": "./src/providers/*.tsx",
    "./hooks/*": "./src/hooks/*.tsx",
    "./lib/utils": "./src/lib/utils.ts",
    "./styles.css": "./src/styles/globals.css",
    "./styles/*": "./src/styles/*"
  }
}
```

Add dependency:

```json
{
  "dependencies": {
    "@radix-ui/colors": "catalog:"
  }
}
```

### 3. Update `packages/ui/src/styles/globals.css`

Change local imports from `./` to work with package resolution:

```css
/* Keep as-is since relative paths work within the package */
@import "./fonts.css";
@import "./radix-color-scale.css";
/* etc. */

/* Remove this line - consuming apps add their own @source */
/* @source "../node_modules/@feel-good/ui"; */
```

### 4. Update consuming apps

Each app's `globals.css` imports the shared styles:

**apps/ui-factory/styles/globals.css:**
```css
@import "tailwindcss";
@import "tw-animate-css";
@import "@feel-good/ui/styles.css";

@source "../node_modules/@feel-good/ui";

/* App-specific overrides if any */
```

**apps/greyboard/styles/globals.css:**
```css
@import "tailwindcss";
@import "tw-animate-css";
@import "@feel-good/ui/styles.css";

@source "../node_modules/@feel-good/ui";

/* Keep greyboard's custom design tokens */
@import "./primitives.css";
@import "./text-colors.css";
/* etc. */
```

**apps/mirror/styles/globals.css:**
```css
@import "tailwindcss";
@import "tw-animate-css";
@import "@feel-good/ui/styles.css";

@source "../node_modules/@feel-good/ui";
```

### 5. Run `pnpm install` from monorepo root

Refresh workspace symlinks after package.json changes.

## Key Considerations

### Tailwind v4 @source Directive

Per documented learning in `docs/solutions/tailwind/monorepo-source-configuration.md`:
- Each app must include `@source "../node_modules/@feel-good/ui"` in its globals.css
- This tells Tailwind to scan the shared package for utility classes
- Use node_modules path (not workspace relative) because pnpm creates symlinks there

### Design Token Differences

Apps have different design systems:
- **ui-factory**: Radix colors (gray, red, green, grass), modern shadcn variables
- **greyboard**: Custom `dq-gray` palette + extensive token system (9 CSS files)
- **mirror**: Minimal Radix gray + red

The shared `@feel-good/ui/styles.css` provides base tokens. Apps can override or extend with their own CSS after the import.

## Acceptance Criteria

- [ ] `packages/ui/src/styles/` contains all 8 CSS files
- [ ] `packages/ui/package.json` exports `./styles.css` and `./styles/*`
- [ ] Apps can import via `@feel-good/ui/styles.css`
- [ ] Tailwind utility classes from shared package work in all apps
- [ ] Each app's existing custom styles continue to work
- [ ] `pnpm build` succeeds for all apps

## Verification

1. Run `pnpm install` from monorepo root
2. Start each app with `pnpm dev --filter=@feel-good/<app-name>`
3. Verify shared styles are applied (check CSS variables in dev tools)
4. Verify app-specific overrides still work
5. Run `pnpm build` to ensure production builds succeed

## References

- Tailwind v4 monorepo source config: `docs/solutions/tailwind/monorepo-source-configuration.md`
- @feel-good/ui CLAUDE.md documents the expected import pattern
- Current ui-factory styles: `apps/ui-factory/styles/globals.css:1-138`
