# 2026-02-06 ui-factory Turbopack Panic Fix

- [x] Confirm failure mode and available Next.js dev flags in current version
- [x] Update `ui-factory` dev scripts to avoid Turbopack persistence crash by default
- [x] Add explicit scripts for Turbopack usage and cache reset recovery
- [x] Verify package scripts and record review notes

## Review

- Updated `apps/ui-factory/package.json`:
  - `dev` now uses `next dev --webpack --port 3002` (stable default).
  - Added `dev:turbo` for explicit Turbopack usage.
  - Added `dev:turbo:reset-cache` to wipe `.next` and relaunch Turbopack.
- Updated `apps/ui-factory/CLAUDE.md` command docs to match new scripts.
- Verification run:
  - `pnpm --filter @feel-good/ui-factory run` (confirmed scripts are registered).
  - `pnpm --filter @feel-good/ui-factory lint` (passes).
  - `pnpm --filter @feel-good/ui-factory run dev --help` (webpack script resolves).
  - `pnpm --filter @feel-good/ui-factory run dev:turbo --help` (turbo script resolves).
  - `pnpm --filter @feel-good/ui-factory run dev:turbo:reset-cache --help` (cache-reset script resolves).
  - `pnpm --filter @feel-good/ui-factory build` (fails in sandbox due blocked network request to `fonts.googleapis.com` for Geist Mono).
- Limitation: this sandbox does not allow binding to local ports (`listen EPERM`), so an interactive browser dev session could not be run here.

# 2026-02-08 Task 083 Server-Side Auth Guard

- [x] Review task spec and auth implementation touch points
- [x] Add server-side auth guard in protected layout
- [x] Verify with mirror lint/type checks
- [x] Update task doc status, acceptance criteria, and work log
- [x] Add review notes

## Review

- Updated `apps/mirror/app/(protected)/layout.tsx` to run `isAuthenticated()` server-side and `redirect("/sign-in")` before rendering protected children.
- Updated task tracker file and moved it to `todos/completed/083-completed-p2-server-side-auth-guard-protected-layout.md` with acceptance criteria checked and completion log added.
- Verification run:
  - `pnpm --filter @feel-good/mirror lint` (passes).
  - `pnpm --filter @feel-good/mirror exec tsc --noEmit` (passes).
  - `pnpm --filter @feel-good/mirror build` (fails in sandbox due blocked Google Fonts fetch for Geist Mono).
