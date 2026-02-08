# Auth Package Architecture Plan (Hybrid Layers + Blocks)

## Overview

This plan formalizes a **hybrid layered architecture** for `@feel-good/features/auth` that combines clear separation of concerns (hooks/ui/primitives) with a `blocks/` layer for page‑level composition. This is recommended because it preserves the explicit layering from the brainstorm **and** directly supports Mirror’s stacked layout and UI‑factory preview use cases without breaking existing imports.

## Goals

- Make auth features plug‑and‑play across apps with a clear, self‑documenting structure.
- Separate headless logic from styled UI, while keeping reusable primitives visible.
- Support both **stacked sections** (Mirror) and **single card** usage.
- Keep existing `@feel-good/features/auth/components` exports working.
- Provide onboarding docs for adding auth to a new app.

## Non‑Goals

- Rebuild the Better Auth client/server integration (keep current `client.ts`, `server.ts`).
- Introduce app‑specific styling overrides; UI remains consistent across apps.

## Target Structure (Hybrid)

```
packages/features/auth/
├── hooks/                 # Headless auth logic
│   ├── use-sign-in.ts
│   ├── use-sign-up.ts
│   ├── use-magic-link.ts
│   ├── use-forgot-password.ts
│   ├── use-reset-password.ts
│   └── index.ts
├── primitives/            # Auth-specific UI atoms (wrappers around @feel-good/ui)
│   ├── auth-input.tsx
│   ├── auth-button.tsx
│   ├── oauth-button.tsx
│   ├── form-error.tsx
│   ├── form-success.tsx
│   └── index.ts
├── ui/                    # Styled card-level components
│   ├── login-card.tsx
│   ├── sign-up-card.tsx
│   ├── forgot-password-card.tsx
│   ├── reset-password-card.tsx
│   └── index.ts
├── blocks/                # Page-level composition (stacked sections)
│   ├── login-block.tsx
│   ├── sign-up-block.tsx
│   └── index.ts
├── components/            # Compatibility exports (re-export from ui/blocks)
├── client.ts              # createAppAuthClient() factory
├── server.ts              # Server-side utilities
├── types.ts               # Shared types
└── index.ts               # Barrel exports
```

## Public API Changes

- New exports:
  - `@feel-good/features/auth/hooks`
  - `@feel-good/features/auth/primitives`
  - `@feel-good/features/auth/ui`
  - `@feel-good/features/auth/blocks`
- Keep existing `@feel-good/features/auth/components` path, but re-export from `ui/` and `blocks/`.

## UI/UX Rules

- Fixed design system across apps (no style overrides).
- Allow **content slots** (links, headings, helper text) but not style overrides.
- `ui/` components render **single card** flows.
- `blocks/` components render **stacked sections** (e.g., password + magic link) to match Mirror.

## Migration Plan

### Phase 1: Build the Layered Foundation

- Create `hooks/` for each auth flow (sign in, sign up, magic link, forgot/reset).
- Create `primitives/` that wrap `@feel-good/ui` primitives with auth-specific ergonomics.
- Create `ui/` card components using hooks + primitives.

### Phase 2: Add Blocks for Page Composition

- Implement `LoginBlock` and `SignUpBlock` in `blocks/`.
- Blocks compose `ui/` cards in stacked layout.
- Add “preview mode” to render without a live `authClient` for UI‑factory.

### Phase 3: Compatibility Exports

- Keep `@feel-good/features/auth/components` working by re-exporting from `ui/` and `blocks/`.
- Update `packages/features/package.json` exports to include new subpaths.

### Phase 4: App Adoption

- **Mirror**: swap `/sign-in` and `/sign-up` to use `LoginBlock` and `SignUpBlock`.
- **UI‑factory**: replace local blocks with `LoginBlock`/`SignUpBlock` in preview mode.

### Phase 5: Documentation

- Add `packages/features/auth/README.md` with onboarding steps.
- Update `packages/features/CLAUDE.md` to document new layers and recommended imports.

## Acceptance Criteria

- `@feel-good/features/auth` exposes hooks, primitives, ui, and blocks subpaths.
- Existing imports from `@feel-good/features/auth/components` still work.
- Mirror pages render stacked password + magic link sections with correct links.
- UI‑factory auth blocks render via package in preview mode.
- Auth flows (password, magic link, OAuth, reset) remain functional.
- Onboarding docs explain setup in under 10 minutes for a new developer.

## Verification Checklist

- `pnpm lint --filter=@feel-good/features` passes.
- `pnpm build --filter=@feel-good/mirror` passes.
- Manual smoke test for sign‑in, sign‑up, magic link, and OAuth in Mirror.

## Risks & Mitigations

- **Risk:** Re‑exports hide new structure.
  - **Mitigation:** Document the preferred import paths and keep `components` as compatibility only.
- **Risk:** Primitives duplicate `@feel-good/ui`.
  - **Mitigation:** Keep primitives thin wrappers around existing `@feel-good/ui` components.
