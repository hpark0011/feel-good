# File Organization Convention (Living Document)

Last updated: 2026-02-09  
Status: active  
Scope: all apps and shared packages in this monorepo

## Why

This convention makes file placement predictable by separating:

1. Route entrypoints
1. Generic shared components
1. Feature-specific code
1. Cross-app reusable features

## Core Rules

### 1) Route Layer (`app/**`)

Allowed in route folders:

1. Next.js route files: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `route.ts`
1. Route-local private components: `app/**/_components/*`

Disallowed for new code in route folders:

1. `_hooks`
1. `_utils`
1. `_data`
1. `_view`
1. `_views`

### 2) Generic Shared Components (`components/**`)

Use `components/` for app-level generic components reused across multiple features/routes in the same app.

Examples:

- providers/wrappers used across many routes
- generic navigation/header/footer pieces
- pure shared UI composition not tied to one domain feature

### 3) Feature Modules (`features/<feature>/**`)

All feature-specific code lives in a feature folder:

```text
features/<feature>/
  components/
  hooks/
  store/
  types/
  utils/
  lib/
  views/
  index.ts
```

Use only the folders needed by that feature.

Naming:

1. Use `views/` (plural) inside `features`.
1. Use `lib/` (singular) for adapters, schemas, data sources, mock data.
1. Keep feature public exports in `index.ts`.

### 4) Cross-App Features (`packages/features/<feature>/**`)

If a feature is reused across apps, move it to `packages/features`.

Promotion triggers:

1. Used by 2+ apps
1. Shared product behavior/UI contract
1. App-agnostic business logic that should be versioned centrally

## Import Boundaries

1. `app/**` can import from:
   - `@/features/*`
   - `@/components/*`
   - `@feel-good/features/*`
1. `features/**` must not import from `app/**`.
1. `components/**` should avoid importing from `app/**`.

## Decision Tree

1. Is it specific to one feature domain?  
   Place in `features/<feature>/...`
1. Is it only UI glue for one route segment?  
   Place in `app/<route>/_components/...`
1. Is it generic within one app?  
   Place in `components/...`
1. Is it shared across apps?  
   Place in `packages/features/<feature>/...`

## Current Migration Direction

### Mirror

Move current route-local feature logic from:

- `app/_view/*`
- `app/(protected)/dashboard/_view/*`
- `app/(protected)/dashboard/articles/_hooks/*`
- `app/(protected)/dashboard/articles/_data/*`
- `app/(protected)/dashboard/articles/_view/*`

into:

- `features/home/views/*`
- `features/profile/views/*`
- `features/articles/hooks/*`
- `features/articles/lib/*`
- `features/articles/views/*`

Keep route-only composition pieces in `app/**/_components`.

### Greyboard

Continue feature-first organization under `apps/greyboard/features/**`; gradually reduce route-local `_hooks/_utils/_views` where logic is stable and reusable in feature modules.

### UI Factory

Treat route demo pages as route entrypoints and keep only route-local composition wrappers there. Move reusable demo logic/UI into `features/**` when it becomes app-wide or cross-app relevant.

## Legacy Note

Existing `_view` / `_views` route directories are legacy and should be migrated opportunistically. Do not add new ones.

## Change Log

1. 2026-02-09: Adopted repo-wide feature-first placement with `app/**/_components` as the only route-private folder pattern for new code.
