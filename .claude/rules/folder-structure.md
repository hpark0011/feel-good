# Folder Structure Convention

Applies to all apps and packages.

## App-Level Root Directories

```
apps/{app-name}/
  app/                    # Next.js App Router (required)
  components/             # App-wide shared components
  features/               # Feature modules (self-contained units)
  hooks/                  # App-wide shared hooks
  lib/                    # Services, schemas, auth clients, env
  config/                 # Configuration constants
  providers/              # React context providers
  store/                  # Zustand stores
  styles/                 # Global styles
  types/                  # App-wide TypeScript types
  utils/                  # App-wide utilities
```

Only create directories when there is code to put in them.

## Route-Level Private Folders

| Directory | Status | Purpose |
|-----------|--------|---------|
| `_components/` | **Active** | Route-specific UI components |
| `_views/` | Legacy | Migrate to `features/<name>/views/` |
| `_hooks/` | Legacy | Migrate to `features/<name>/hooks/` |
| `_utils/` | Legacy | Migrate to `features/<name>/utils/` |
| `_data/` | Legacy | Migrate to `features/<name>/lib/` |
| `_lib/` | Legacy | Migrate to `features/<name>/lib/` |

Only `_components/` should be used for new code. All other route-private logic belongs in `features/<feature>/`. The underscore prefix prevents Next.js routing.

## Feature Module Structure

```
features/{feature-name}/
  components/     # Feature UI components
  hooks/          # Feature hooks
  utils/          # Feature utilities
  types/          # Feature types (or types.ts)
  store/          # Feature state (optional)
  context/        # Feature React context (optional)
  index.ts        # PUBLIC API (required)
```

## Package-Level Structure

Cross-app code lives in `packages/`. No underscore prefix at package level.

```
packages/features/{feature-name}/
  blocks/         # Drop-in page sections
  components/     # UI components (forms/, shared/)
  views/          # Pure UI (no underscore)
  hooks/          # Headless logic
  lib/            # Schemas, utilities
  index.ts        # Public API
```

## Code Promotion Ladder

```
Route-level (_components/, _hooks/)
    | Used by 2+ sibling routes
    v
App-level (components/, hooks/, features/)
    | Used by 2+ apps
    v
Package-level (packages/features/, packages/utils/)
```
