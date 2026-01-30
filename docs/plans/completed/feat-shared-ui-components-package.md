# feat: Create Shared UI Components Package

## Overview

Create a shared UI components package (`@feel-good/ui`) that separates shadcn/ui components from custom-built components. This package will follow the existing monorepo patterns and use the Just-in-Time compilation strategy (no build step).

## Problem Statement / Motivation

Currently, UI components live inside the greyboard app at `apps/greyboard/components/ui/`. As the monorepo grows with additional apps, there's no way to share these components. A dedicated `@feel-good/ui` package will:

1. Enable component reuse across multiple apps
2. Provide clear separation between vendor components (shadcn/ui) and custom components
3. Follow established package patterns from `@feel-good/icons` and `@feel-good/utils`

## Proposed Solution

Create a new package at `packages/ui/` with this structure:

```
packages/ui/
├── src/
│   ├── primitives/          # shadcn/ui components (CLI-managed)
│   │   └── .gitkeep
│   ├── components/          # Custom-built components (empty for now)
│   │   └── .gitkeep
│   ├── hooks/               # Shared UI hooks
│   │   └── .gitkeep
│   ├── lib/
│   │   └── utils.ts         # cn() utility (re-exports from @feel-good/utils)
│   └── styles/
│       └── globals.css      # Base Tailwind styles with CSS variables
├── components.json          # shadcn CLI configuration
├── package.json
└── tsconfig.json
```

### Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Compilation strategy | Just-in-Time | Matches existing packages, no build step needed |
| cn() utility | Re-export from @feel-good/utils | Avoid duplication, single source of truth |
| Export pattern | Explicit per-component exports | Better tree-shaking, clearer API |
| CSS variables | Provide defaults, apps override | Self-contained but customizable |
| shadcn folder name | `primitives/` | Distinguishes vendor from custom |
| Custom folder name | `components/` | Reserved for custom-built components |

## Technical Approach

### 1. Package Configuration

#### package.json

```json
{
  "name": "@feel-good/ui",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "sideEffects": false,
  "exports": {
    "./primitives/*": "./src/primitives/*.tsx",
    "./components/*": "./src/components/*.tsx",
    "./hooks/*": "./src/hooks/*.tsx",
    "./lib/utils": "./src/lib/utils.ts",
    "./styles.css": "./src/styles/globals.css"
  },
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "react-dom": "^18.0.0 || ^19.0.0"
  },
  "dependencies": {
    "@feel-good/utils": "workspace:*",
    "@radix-ui/react-slot": "^1.2.3",
    "class-variance-authority": "^0.7.1"
  },
  "devDependencies": {
    "@feel-good/eslint-config": "workspace:*",
    "@feel-good/tsconfig": "workspace:*",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "typescript": "^5"
  },
  "scripts": {
    "lint": "eslint .",
    "check-types": "tsc --noEmit"
  }
}
```

#### tsconfig.json

```json
{
  "extends": "@feel-good/tsconfig/react-library.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@feel-good/ui/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

#### components.json (for shadcn CLI)

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "src/styles/globals.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "iconLibrary": "lucide",
  "aliases": {
    "components": "@feel-good/ui/primitives",
    "utils": "@feel-good/ui/lib/utils",
    "hooks": "@feel-good/ui/hooks",
    "lib": "@feel-good/ui/lib",
    "ui": "@feel-good/ui/primitives"
  }
}
```

### 2. Utility Re-export

```typescript
// src/lib/utils.ts
export { cn } from "@feel-good/utils/cn";
```

### 3. Base Styles

```css
/* src/styles/globals.css */
@import "tailwindcss";

@theme {
  /* Base shadcn/ui CSS variables */
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.145 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.97 0 0);
  --secondary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --accent-foreground: oklch(0.205 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);
  --radius: 0.625rem;
}
```

### 4. Consumer App Configuration

Apps consuming `@feel-good/ui` need to:

1. Add dependency in `package.json`:
```json
{
  "dependencies": {
    "@feel-good/ui": "workspace:*"
  }
}
```

2. Configure Next.js to transpile:
```javascript
// next.config.js
const nextConfig = {
  transpilePackages: ["@feel-good/ui"]
};
```

3. Import or override styles in app's CSS:
```css
/* apps/greyboard/app/globals.css */
@import "tailwindcss";
@import "@feel-good/ui/styles.css";

/* Override with app-specific theme */
@theme {
  --primary: var(--dq-accent);
  /* ... */
}
```

4. Add source to Tailwind content (if using custom config):
```css
@source "../../packages/ui/src/**/*.tsx";
```

## Implementation Phases

### Phase 1: Package Scaffolding
- [ ] Create `packages/ui/` directory structure
- [ ] Create `package.json` with exports configuration
- [ ] Create `tsconfig.json` extending react-library
- [ ] Create `src/lib/utils.ts` re-exporting cn
- [ ] Create `src/styles/globals.css` with base CSS variables
- [ ] Create `.gitkeep` files in empty directories
- [ ] Run `pnpm install` from root

### Phase 2: shadcn CLI Configuration
- [ ] Create `components.json` for the package
- [ ] Test shadcn CLI: `npx shadcn@latest add button` (from packages/ui)
- [ ] Verify component generates in `src/primitives/`
- [ ] Verify imports resolve correctly

### Phase 3: Consumer Integration
- [ ] Add `@feel-good/ui` to greyboard dependencies
- [ ] Update greyboard's `next.config.js` with transpilePackages
- [ ] Update greyboard's CSS to import package styles
- [ ] Test importing a primitive component

## Acceptance Criteria

### Functional Requirements
- [ ] Package exports TypeScript files directly (JIT)
- [ ] shadcn CLI generates components to `src/primitives/`
- [ ] Components use `cn()` from `@feel-good/utils`
- [ ] Apps can import components: `import { Button } from "@feel-good/ui/primitives/button"`
- [ ] Tailwind classes are generated correctly in consuming apps

### Non-Functional Requirements
- [ ] No build step required for the package
- [ ] TypeScript types resolve in IDE
- [ ] Tree-shaking works (unused components not bundled)

### Quality Gates
- [ ] `pnpm lint --filter=@feel-good/ui` passes
- [ ] `pnpm check-types` passes (add to turbo.json if needed)
- [ ] Component renders correctly in greyboard app

## Files to Create

| File | Purpose |
|------|---------|
| `packages/ui/package.json` | Package configuration with exports |
| `packages/ui/tsconfig.json` | TypeScript configuration |
| `packages/ui/components.json` | shadcn CLI configuration |
| `packages/ui/src/lib/utils.ts` | Re-export cn() utility |
| `packages/ui/src/styles/globals.css` | Base Tailwind CSS variables |
| `packages/ui/src/primitives/.gitkeep` | Placeholder for shadcn components |
| `packages/ui/src/components/.gitkeep` | Placeholder for custom components |
| `packages/ui/src/hooks/.gitkeep` | Placeholder for shared hooks |

## Files to Update

| File | Change |
|------|--------|
| `apps/greyboard/next.config.ts` | Add `@feel-good/ui` to transpilePackages |
| `apps/greyboard/package.json` | Add `@feel-good/ui` dependency |

## Dependencies

### New Dependencies for @feel-good/ui

| Package | Version | Type | Reason |
|---------|---------|------|--------|
| `@feel-good/utils` | workspace:* | dependency | For cn() utility |
| `@radix-ui/react-slot` | ^1.2.3 | dependency | Required by shadcn components |
| `class-variance-authority` | ^0.7.1 | dependency | For component variants |
| `react` | ^18.0.0 \|\| ^19.0.0 | peerDependency | React runtime |
| `react-dom` | ^18.0.0 \|\| ^19.0.0 | peerDependency | React DOM |

## Future Considerations

1. **Component Migration**: Once the package is stable, migrate existing greyboard components incrementally
2. **Additional Apps**: New apps can depend on `@feel-good/ui` immediately
3. **Custom Components**: Add custom components to `src/components/` as needed
4. **Shared Hooks**: Add commonly used UI hooks to `src/hooks/`
5. **Theming**: Consider a theme provider for runtime theme switching

## References

### Internal References
- Package pattern: `packages/icons/package.json`
- TypeScript config: `tooling/typescript/react-library.json`
- Utils package: `packages/utils/src/cn.ts`
- Current UI components: `apps/greyboard/components/ui/`

### External References
- [shadcn/ui Monorepo Docs](https://ui.shadcn.com/docs/monorepo)
- [Turborepo Internal Packages](https://turborepo.dev/docs/core-concepts/internal-packages)
- [Tailwind CSS v4](https://tailwindcss.com/docs/v4-beta)

---

Generated with [Claude Code](https://claude.com/claude-code)
