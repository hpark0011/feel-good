---
title: "feat: Monorepo File Organization Convention"
type: feat
date: 2026-02-09
scope: monorepo
apps:
  - mirror
  - greyboard
  - ui-factory
packages:
  - features
status: proposed
---

# feat: Monorepo File Organization Convention

## Objective

Standardize folder organization across all apps and packages using a feature-first model, while preserving clear route boundaries in Next.js App Router.

This plan follows the requested preferences:

- Organize by feature (Greyboard pattern as baseline)
- Keep generic shared components in `components/`
- Keep route-local components in `app/**/_components/`
- Keep feature-specific components/hooks/stores/types/utils/lib(s)/views in `features/`
- Keep cross-app features in `packages/features/`

## Agent Reports

### 1) Best Practice Research Agent

#### Findings

1. Next.js App Router supports colocation and private folders in routes.
1. Prefixing folders with `_` keeps them out of route segments.
1. Feature-folder organization is recommended when code grows by domain.
1. Monorepo guidance favors extracting reusable code into shared packages with clear ownership.

#### Evidence (Primary Sources)

- Next.js docs: Route Colocation and Private Folders  
  https://nextjs.org/docs/app/building-your-application/routing/colocation
- Next.js docs: Project Organization and route groups  
  https://nextjs.org/docs/app/building-your-application/routing/project-structure
- Redux Style Guide: organize by feature folders  
  https://redux.js.org/style-guide
- Turborepo Handbook: internal packages for shared code  
  https://turbo.build/repo/docs/handbook

### 2) Code Inspector Agent

#### Current Convention Snapshot

- `apps/greyboard` is strongly feature-first (`features/**` with `components/hooks/utils/types/store`), but still has route-level `_hooks/_utils/_views` under `app/(protected)/dashboard/tasks`.
- `apps/mirror` has an empty top-level `features/` and currently keeps feature logic under route folders (`_hooks`, `_data`, `_view`).
- `apps/ui-factory` uses a route-local showcase structure (`_components`, `_views`, `_utils`) under `app/components/*` and `app/blocks/*`.

#### Inconsistencies

1. Naming drift: `_view` (mirror) vs `_views` (greyboard, ui-factory).
1. Placement drift: route folders in mirror currently hold feature logic (`_hooks`, `_data`, `_view`) instead of `features/`.
1. Cross-app boundary drift: some app-local functionality is reusable but not evaluated for promotion to `packages/features`.
1. Predictability gap: similar code types (views/hooks/utils) are stored in different places depending on app and date of implementation.

### 3) Code Historian Agent

#### Timeline of Convention Evolution

1. `2026-02-05` PR #103 (`6d6764b0`) introduced/normalized `_views` in multiple areas and renamed greyboard `_view` -> `_views`.
1. `2026-02-08` mirror profile work (`6fc3087e`, `05ead291`) renamed mirror home `_views` -> `_view` and added route-local `articles/_data`, `articles/_hooks`, `articles/_view`.
1. `2026-02-08` review todo #084 flagged this drift and conflicts with completed todo #052.
1. `2026-02-09` commit `2f16d266` continued mirror `_view` usage (`dashboard-view` -> `profile-info-view`).

#### Historian Inputs Used

- Git history for `apps/mirror`, `apps/greyboard`, `apps/ui-factory`, `packages/features`
- Local todo/decision artifacts:
  - `todos/084-pending-p2-views-naming-convention-violation.md`
  - `todos/completed/052-completed-p3-views-vs-view-directory-naming.md`
- GitHub PR pages accessible from local references:
  - https://github.com/hpark0011/feel-good/pull/103
  - https://github.com/hpark0011/feel-good/pull/104

Note: `gh` CLI API calls were blocked in this environment, so local git metadata and tracked todo references were used as the primary historical source.

## Problem Statement

The repository currently has multiple valid-but-conflicting placement rules:

- Some app code is organized by route slice.
- Some app code is organized by feature.
- Some shared code is promoted to `packages/features`, while similar code remains app-local.
- Route-private folder naming (`_view` vs `_views`) is inconsistent.

This makes file placement unpredictable, increases review overhead, and slows onboarding.

## Proposed Convention (Target State)

### Rule A: Folder Roles

1. `app/**`: route entrypoints only (`page`, `layout`, `loading`, `error`, `not-found`, `route`) plus route-local `_components`.
1. `components/**`: generic shared app-level UI components (not feature-specific).
1. `features/<feature>/**`: all feature-specific components/hooks/stores/types/utils/lib/views.
1. `packages/features/<feature>/**`: cross-app reusable feature modules.

### Rule B: Route-Local Limit

Only `_components` is allowed under route folders for private route composition.  
Do not create new route-local `_hooks`, `_utils`, `_data`, `_view`, `_views`.

### Rule C: Feature Folder Shape

Use this canonical shape (omit folders that are unnecessary):

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

### Rule D: Naming

1. Use `views/` (plural) inside `features/`.
1. Do not use `_view` or `_views` in new route-local folders.
1. Use `lib/` (singular) for implementation helpers and adapters.

### Rule E: Promotion to `packages/features`

Promote a feature from app-local to `packages/features` when at least one is true:

1. It is used by 2+ apps.
1. It is expected to be product-consistent across apps.
1. It contains reusable business logic with app-agnostic dependencies.

## Migration Plan

### Phase 1: Lock Convention + Documentation (this task)

- Publish plan in `docs/plans`
- Publish living convention doc in `docs/conventions`
- Align task tracking in `tasks/todo.md`

### Phase 2: Mirror Realignment

Move mirror route-local feature logic into `features/`:

- `app/_view/home-page-view.tsx` -> `features/home/views/home-page-view.tsx`
- `app/(protected)/dashboard/_view/profile-info-view.tsx` -> `features/profile/views/profile-info-view.tsx`
- `app/(protected)/dashboard/articles/_hooks/use-article-list.ts` -> `features/articles/hooks/use-article-list.ts`
- `app/(protected)/dashboard/articles/_data/mock-articles.ts` -> `features/articles/lib/mock-articles.ts`
- `app/(protected)/dashboard/articles/_view/article-list-view.tsx` -> `features/articles/views/article-list-view.tsx`

Keep route-local wrappers in:

- `app/(protected)/dashboard/_components/`
- `app/(protected)/dashboard/articles/_components/`

### Phase 3: Greyboard Alignment

- Keep feature modules in `apps/greyboard/features/**` as primary source of truth.
- Gradually reduce route-local `_hooks/_utils/_views` under `tasks` by moving stable logic into `features/`.
- Keep only route-local composition UI in `app/**/_components`.

### Phase 4: UI Factory Alignment

- Preserve UI Factory’s showcase intent, but relocate non-route-specific logic to `features/` when reused by app demos.
- Continue keeping demo-page-only wrappers under route `_components`.
- Avoid introducing new `_views` trees outside features.

### Phase 5: Enforcement

- Add a lightweight repository check (script or lint rule) that fails on new route-local `_hooks/_utils/_data/_view/_views`.
- Add import-boundary checks:
  - `features/**` must not import from `app/**`
  - route files may import from `features/**`, `components/**`, `packages/features/**`

## Acceptance Criteria

- [ ] Convention doc exists and is referenced by future planning work.
- [ ] New code follows role boundaries (`app`, `components`, `features`, `packages/features`).
- [ ] No new route-local `_hooks`, `_utils`, `_data`, `_view`, `_views`.
- [ ] Mirror has an approved migration sequence for moving feature logic into `apps/mirror/features`.
- [ ] Team has explicit promotion criteria to move app-local features into `packages/features`.

## Deliverables

1. Plan document: `docs/plans/2026-02-09-feat-file-organization-convention-plan.md`
1. Living convention document: `docs/conventions/file-organization-convention.md`

