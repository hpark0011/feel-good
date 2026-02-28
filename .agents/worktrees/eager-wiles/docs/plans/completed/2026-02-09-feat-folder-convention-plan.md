---
title: "feat: Standardize Folder Organization Convention"
type: feat
date: 2026-02-09
scope: monorepo
apps:
  - mirror
  - greyboard
  - ui-factory
status: implemented
---

# feat: Standardize Folder Organization Convention

## Problem Statement

Mirror, Greyboard, and UI-Factory have divergent folder organization patterns. Mirror uses `_view/` (singular) in 3 locations while Greyboard and UI-Factory use `_views/` (plural) — the convention established by Todo #052.

No documented convention guide existed as a Claude rule, making it hard to stay consistent as the codebase grows.

## Convention Standard

The living convention is documented in `.claude/rules/folder-structure.md` (auto-loaded by Claude for all `apps/**` and `packages/**` paths).

Key decisions:
- `_views/` (plural) is the standard — consistent with `_components/`, `_hooks/`, `_utils/`
- All route-level private folders use plural names with underscore prefix
- Feature modules use `features/{name}/{components,hooks,utils,types,store,views}/`
- Cross-app features promote to `packages/features/`

## Migration Steps

### Completed: Rename Mirror `_view/` to `_views/`

3 directory renames:
- `apps/mirror/app/_view/` -> `apps/mirror/app/_views/`
- `apps/mirror/app/(protected)/dashboard/_view/` -> `apps/mirror/app/(protected)/dashboard/_views/`
- `apps/mirror/app/(protected)/dashboard/articles/_view/` -> `apps/mirror/app/(protected)/dashboard/articles/_views/`

2 files with import updates:
- `apps/mirror/app/page.tsx` — updated `_view` to `_views` in import
- `apps/mirror/app/(protected)/dashboard/page.tsx` — updated 2 imports from `_view` to `_views`

## Acceptance Criteria

- [x] All `_view/` directories in Mirror renamed to `_views/`
- [x] All imports updated — no stale `/_view/` references in Mirror
- [x] Convention doc created at `.claude/rules/folder-structure.md`
- [x] Root `CLAUDE.md` references the convention doc
- [x] Mirror `CLAUDE.md` has Project Structure section
- [x] Todo #084 resolved and completed
- [x] Build passes
