# Feel Good Monorepo

Turborepo monorepo with 3 Next.js applications and shared packages.

## Quick Start

```bash
pnpm install           # Install all dependencies
pnpm dev               # Run all apps in dev mode
pnpm build             # Build all packages
pnpm lint              # Lint all packages
pnpm format            # Format all files
```

### Filtered Commands

```bash
pnpm dev --filter=@feel-good/greyboard    # Run single app
pnpm build --filter=@feel-good/greyboard  # Build single app
pnpm lint --filter=@feel-good/greyboard   # Lint single app
```

## Monorepo Structure

```
apps/           Next.js applications (greyboard, mirror, ui-factory)
packages/       Shared libraries (ui, features, icons, utils, convex)
tooling/        Shared configs (eslint, prettier, typescript)
```

## Apps

| App | Description | Port |
|-----|-------------|------|
| greyboard | AI-powered task management | 3000 |
| mirror | Interactive blogging platform | 3001 |
| ui-factory | Design system showcase | 3002 |

## Package Import Patterns

| Package | Import Example |
|---------|----------------|
| @feel-good/ui | `@feel-good/ui/primitives/button` |
| @feel-good/features | `@feel-good/features/auth/blocks` |
| @feel-good/icons | `@feel-good/icons` |
| @feel-good/utils | `@feel-good/utils/cn` |
| @feel-good/convex | `@feel-good/convex` |

### Auth Package Layers

| Layer | Import | Purpose |
|-------|--------|---------|
| Blocks | `@feel-good/features/auth/blocks` | Drop-in page sections |
| Forms | `@feel-good/features/auth/components/forms` | Complete forms with logic |
| Views | `@feel-good/features/auth/views` | Pure UI components |
| Hooks | `@feel-good/features/auth/hooks` | Headless auth logic |

## TypeScript Configs

Extend from `@feel-good/tsconfig`:

| Config | Use Case |
|--------|----------|
| `base.json` | Backend/non-browser packages (e.g., Convex) |
| `react-library.json` | React component libraries (ui, icons, features) |
| `nextjs.json` | Next.js applications (greyboard, mirror) |

## Core Principles

- **Simplicity First** — Make every change as simple as possible. Impact minimal code.
- **No Laziness** — Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact** — Changes should only touch what is necessary. Avoid introducing bugs.

## Adding a New App

1. Create directory in `apps/`
2. Add `package.json` with name `@feel-good/app-name`
3. Reference workspace packages: `"@feel-good/utils": "workspace:*"`
4. Run `pnpm install` from root

## Adding a New Package

1. Create directory in `packages/`
2. Add `package.json` with name `@feel-good/package-name`
3. Add to consuming apps' dependencies
4. Run `pnpm install` from root
