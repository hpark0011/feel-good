# Feel Good Monorepo

Turborepo monorepo containing multiple applications and shared packages.

## Quick Start

```bash
pnpm install           # Install all dependencies
pnpm dev               # Run all apps in dev mode
pnpm build             # Build all packages
pnpm lint              # Lint all packages
pnpm format            # Format all files
```

## Filtered Commands

```bash
pnpm dev --filter=@feel-good/greyboard    # Run single app
pnpm build --filter=@feel-good/greyboard  # Build single app
pnpm lint --filter=@feel-good/greyboard   # Lint single app
```

## Structure

- `apps/` — Next.js applications (greyboard, mirror, ui-factory)
- `packages/` — Shared libraries (ui, features, icons, utils, convex)
- `tooling/` — Shared configs (eslint, prettier, typescript)

Each app has its own `CLAUDE.md` with app-specific documentation.

## Apps

| App | Description | Port |
|-----|-------------|------|
| greyboard | AI-powered task management | 3000 |
| mirror | Auth dashboard (Convex + Better Auth) | 3001 |
| ui-factory | Design system showcase | 3002 |

## Packages

| Package | Purpose | Example Import |
|---------|---------|----------------|
| @feel-good/ui | shadcn/ui primitives | `@feel-good/ui/primitives/button` |
| @feel-good/features | Auth components/hooks | `@feel-good/features/auth/components` |
| @feel-good/icons | SVG icon components | `@feel-good/icons` |
| @feel-good/utils | Utilities (cn, etc.) | `@feel-good/utils/cn` |
| @feel-good/convex | Convex backend | `@feel-good/convex` |

## TypeScript Configs

Extend from `@feel-good/tsconfig`:
- `nextjs.json` — Next.js apps
- `react-library.json` — React packages (ui, icons, features)
- `base.json` — Non-browser packages (convex)

### Personal Preferences

Copy `CLAUDE.local.md.example` to `CLAUDE.local.md` for personal preferences (gitignored).
