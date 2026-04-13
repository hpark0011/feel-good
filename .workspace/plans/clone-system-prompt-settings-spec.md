# Clone Settings — Product Spec

## Overview

The "Clone" tab gives authenticated profile owners a structured interface for customizing how their AI clone speaks: a tone preset, a free-form persona textarea, and a topics-to-avoid field. Settings are persisted in Convex and injected into the chat system prompt at inference time. The tab is hidden from non-owners and is architecturally isolated from the content-routing system so that `ContentKind` and its dependent types remain untouched.

---

## Requirements

### Functional Requirements

| ID    | Requirement                                                                                                                               | Verification Criterion                                                                                                                                                                                                              |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR-01 | A "Clone" tab appears in the profile tab strip for the authenticated owner                                                                | Playwright: owner session — assert `data-testid="profile-tab-clone-settings"` is visible                                                                                                                                            |
| FR-02 | The "Clone" tab is absent for non-owners                                                                                                  | Playwright: non-owner session — assert locator for `data-testid="profile-tab-clone-settings"` does not exist                                                                                                                        |
| FR-03 | Direct URL `/@username/clone-settings` returns 404 for non-owners                                                                         | Playwright: non-owner session — navigate; assert Next.js `not-found.tsx` markup is rendered (`[data-testid="not-found"]` or `h1` containing "404")                                                                                  |
| FR-04 | Clicking the Clone tab renders settings in the desktop right panel                                                                        | Playwright: owner session — click tab; assert `data-testid="clone-settings-panel"` visible; URL contains `/clone-settings`                                                                                                          |
| FR-05 | Tone preset selector renders six options: Professional, Friendly, Witty, Empathetic, Direct, Curious                                      | Unit test: render `TonePresetSelect`; assert all six labels in DOM                                                                                                                                                                  |
| FR-06 | Tone preset options and labels are sourced exclusively from `tonePresets.ts`                                                              | Grep: no inline string literals for Professional, Friendly, Witty, Empathetic, Direct, or Curious appear in UI files; `TonePresetSelect` imports from the shared module                                                             |
| FR-07 | Core persona textarea accepts up to 4000 characters                                                                                       | UT: type 4001 chars → counter element `data-state="danger"`; form-level zod rejects                                                                                                                                                 |
| FR-08 | Topics-to-avoid textarea accepts up to 500 characters                                                                                     | UT: type 501 chars → counter `data-state="danger"`; zod rejects                                                                                                                                                                     |
| FR-09 | Character counter shows `data-state="warning"` at ≥ 80% of the limit                                                                      | UT: 3200/4000 chars → `data-state="warning"`                                                                                                                                                                                        |
| FR-10 | Empty persona field falls back to `DEFAULT_PERSONA` server-side                                                                           | UT on `loadStreamingContext`: `personaPrompt: null` → output contains `DEFAULT_PERSONA` literal                                                                                                                                     |
| FR-11 | Saving valid form data calls `updatePersonaSettings` with correct payload                                                                 | UT: mock mutation; submit; assert called with `{ tonePreset, personaPrompt, topicsToAvoid }`                                                                                                                                        |
| FR-12 | Form is pre-populated with the owner's current settings on mount                                                                          | Playwright: seed DB; navigate; textarea value matches seeded value                                                                                                                                                                  |
| FR-13 | Save button is disabled while the mutation is in flight                                                                                   | UT: mock slow mutation; assert `button[type=submit][disabled]` during pending                                                                                                                                                       |
| FR-14 | "Clear all customizations" opens a confirmation dialog                                                                                    | Playwright: click → `role=alertdialog` visible                                                                                                                                                                                      |
| FR-15 | Confirming clear resets all three fields to null server-side and empty client-side                                                        | Playwright: confirm → fields empty; `getCurrentProfile` returns `null` for all three                                                                                                                                                |
| FR-16 | Confirmation dialog body reads verbatim: "This removes your tone, persona, and topics. Your clone will fall back to the default persona." | UT: render dialog; assert exact string in DOM                                                                                                                                                                                       |
| FR-17 | Convex mutation rejects `personaPrompt` > 4000 chars                                                                                      | UT: pass 4001-char string → throws `personaPrompt exceeds 4000 characters`                                                                                                                                                          |
| FR-18 | Convex mutation rejects `topicsToAvoid` > 500 chars                                                                                       | UT: pass 501-char string → throws `topicsToAvoid exceeds 500 characters`                                                                                                                                                            |
| FR-19 | `loadStreamingContext` composes: SAFETY_PREFIX → tone clause → bio → personaPrompt → topics (joined with `\n\n`)                          | UT: pass all fields; assert exact ordering in output                                                                                                                                                                                |
| FR-20 | `loadStreamingContext` omits tone clause when `tonePreset` is null                                                                        | UT: `tonePreset: null` → output contains no clause from `TONE_PRESETS`                                                                                                                                                              |
| FR-21 | `loadStreamingContext` omits topics line when `topicsToAvoid` is null                                                                     | UT: `topicsToAvoid: null` → output does not contain "Avoid discussing:"                                                                                                                                                             |
| FR-22 | Mobile viewport: navigating to `/@username/clone-settings` renders the settings panel via `MobileWorkspace` with `routeState = null`      | Playwright mobile viewport: navigate; assert panel visible; no console errors                                                                                                                                                       |
| FR-23 | `MobileWorkspace` does not attempt scroll restore when `routeState` is null                                                               | UT: render with `routeState={null}`; spy on `scrollContainer.scrollTo` → zero calls                                                                                                                                                 |
| FR-24 | Clearing an individual field (save with that field blank) sets the DB column to `null`, not leaves it unchanged                           | UT: pre-seed `personaPrompt="x"`; submit form with blank persona; assert DB row has `personaPrompt: null`                                                                                                                           |
| FR-25 | `clone-settings/page.tsx` server component computes `isOwner` via `fetchAuthQuery` (not React context) and calls `notFound()` when false  | Code inspection: file imports `fetchAuthQuery`; calls `api.auth.queries.getCurrentUser` and `api.users.queries.getByUsername`; compares `authId` like `app/[username]/layout.tsx:45-48`; UT snapshot or static grep for the pattern |

### Non-Functional Requirements

| ID     | Requirement                                                                                                                                                                                                                       |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| NFR-01 | `ContentKind`, `CONTENT_KINDS`, `isContentKind`, `ContentRouteState`, `getContentRouteState`, and `CONTENT_KIND_LABELS` must not be modified                                                                                      |
| NFR-02 | `savedScrollTopByKind` in `useProfileNavigationEffects` must remain typed as `Record<ContentKind, number>` with no widening                                                                                                       |
| NFR-03 | `personaPrompt`, `tonePreset`, and `topicsToAvoid` must NOT be added to `publicProfileReturnValidator` or returned by `getByUsername`                                                                                             |
| NFR-04 | Persona fields are only readable via `getCurrentProfile`, which returns exclusively the caller's own data                                                                                                                         |
| NFR-05 | `getCurrentProfile` uses a new `currentProfileReturnValidator` containing the three persona fields; the pre-existing `profileReturnValidator` is left untouched to avoid leaking persona fields to any other query that shares it |
| NFR-06 | Tone preset definitions (key, label, clause) live exclusively in `packages/convex/convex/chat/tonePresets.ts`; UI imports from the same module via a working package-export entry (see Architecture → Cross-package import)       |
| NFR-07 | No new external runtime dependencies are introduced                                                                                                                                                                               |
| NFR-08 | The settings route does not participate in scroll-memory infrastructure                                                                                                                                                           |
| NFR-09 | The injection-advisory detector is explicitly out of scope — must not be built                                                                                                                                                    |

---

## Architecture

### Data Flow

1. `CloneSettingsPanel` client component mounts inside the `@content/clone-settings` parallel route segment.
2. It calls `useQuery(api.users.queries.getCurrentProfile)`. The query executes server-side, `authComponent.safeGetAuthUser(ctx)` identifies the caller, and the handler returns `{ personaPrompt, tonePreset, topicsToAvoid, ... }` from the caller's own user row. There is no non-owner code path.
3. The returned values seed react-hook-form default values. A zod resolver enforces field lengths at the form layer.
4. On submit, the form calls `useMutation(api.users.mutations.updatePersonaSettings)` with `{ tonePreset, personaPrompt, topicsToAvoid }`. The mutation runs as `authMutation`, validates lengths (throwing before any DB write), and issues a single `ctx.db.patch` on the caller's user row.
5. At chat inference time, `loadStreamingContext` reads `personaPrompt`, `tonePreset`, and `topicsToAvoid` from the user row and assembles the system prompt (see Composition Order below).

### Composition Order in `loadStreamingContext`

Non-empty segments, joined with `\n\n`:

```text
1. SAFETY_PREFIX(name)
2. TONE_PRESETS[tonePreset].clause          — omitted when tonePreset is null
3. `Bio: ${bio}`                             — omitted when bio is falsy
4. personaPrompt || DEFAULT_PERSONA
5. `Avoid discussing: ${topicsToAvoid}`      — omitted when topicsToAvoid is null
```

### Tab Registry Separation

A new concept `ProfileTabKind` is introduced, distinct from `ContentKind`. `ContentKind` remains `"posts" | "articles"` and is not touched. All content-routing machinery (`isContentKind`, `getContentRouteState`, `ContentRouteState`, `savedScrollTopByKind`) is unchanged.

```ts
// apps/mirror/features/profile-tabs/types.ts
export const PROFILE_TAB_KINDS = [
  "posts",
  "articles",
  "clone-settings",
] as const;
export type ProfileTabKind = (typeof PROFILE_TAB_KINDS)[number];
export const PROFILE_TAB_LABELS: Record<ProfileTabKind, string> = {
  posts: "Posts",
  articles: "Articles",
  "clone-settings": "Clone",
};
export function isProfileTabKind(
  value: string | null | undefined,
): value is ProfileTabKind {
  return (
    value === "posts" || value === "articles" || value === "clone-settings"
  );
}
export function getProfileTabHref(
  username: string,
  kind: ProfileTabKind,
): string {
  return `/@${username}/${kind}`;
}
```

The existing `ContentKindTabs` is renamed to `ProfileTabs` (outright rename, no shim). `ProfileTabs` is a client component, reads `isOwner` from `useProfileRouteData()`, and filters `"clone-settings"` out of its iteration when `!isOwner`. It must always render inside a `ProfileRouteDataProvider`; this is guaranteed by the existing layout tree (`app/[username]/layout.tsx` wraps the whole subtree).

### Panel Expansion & Routing in `workspace-shell.tsx`

```ts
const hasContentRoute = isProfileTabKind(segments[0]);

const routeState: ContentRouteState | null =
  segments[0] === "clone-settings" ? null : getContentRouteState(segments);
```

- `hasContentRoute` becomes true for settings, so the desktop panel expands and the mobile redirect is suppressed.
- `routeState` is `null` for settings, so `ContentPanel` / `MobileWorkspace` / `useProfileNavigationEffects` skip scroll-restore entirely.
- `ContentPanel` and `MobileWorkspace` prop types change to `routeState: ContentRouteState | null`.
- `useProfileNavigationEffects` either early-returns when `routeState` is null or is simply not invoked by the settings render path.

### Owner-Gate on Direct URL (server component)

`apps/mirror/app/[username]/@content/clone-settings/page.tsx` is a Next.js server component. It does NOT rely on React context (unavailable to server components). It mirrors the existing pattern in `app/[username]/layout.tsx:45-48`:

```ts
import { notFound } from "next/navigation";
import { fetchAuthQuery } from "...";
import { api } from "@feel-good/convex/_generated/api";

export default async function CloneSettingsPage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const [currentAuthUser, profileData] = await Promise.all([
    fetchAuthQuery(api.auth.queries.getCurrentUser, {}),
    fetchAuthQuery(api.users.queries.getByUsername, { username }),
  ]);

  const isOwner =
    !!currentAuthUser &&
    !!profileData?.authId &&
    currentAuthUser._id === profileData.authId;

  if (!isOwner) notFound();

  return <CloneSettingsPanel />;
}
```

No `layout.tsx` is needed under `@content/clone-settings/` — the single `page.tsx` file is sufficient. No `default.tsx` change is required; the existing root `@content/default.tsx` continues to render null when the settings slot is inactive.

### Cross-package import of `TONE_PRESETS`

This is a **blocking task for Phase A** because Phase B cannot compile without it. The `packages/convex/package.json` already has explicit `exports` and `typesVersions` entries for `_generated/` paths (per MEMORY.md: "wildcard exports don't resolve `.d.ts` with bundler module resolution"). Add a dedicated entry:

```jsonc
// packages/convex/package.json
{
  "exports": {
    // ... existing entries ...
    "./chat/tonePresets": {
      "types": "./convex/chat/tonePresets.ts",
      "default": "./convex/chat/tonePresets.ts",
    },
  },
  "typesVersions": {
    "*": {
      // ... existing entries ...
      "chat/tonePresets": ["./convex/chat/tonePresets.ts"],
    },
  },
}
```

UI imports: `import { TONE_PRESETS, type TonePreset } from "@feel-good/convex/chat/tonePresets";`

**Phase A smoke-import step** (part of the verification gate): temporarily add `import { TONE_PRESETS } from "@feel-good/convex/chat/tonePresets"` inside `packages/convex/convex/users/mutations.ts` (a file that is already part of the Convex build) OR in a throwaway file under `apps/mirror/lib/__smoke__/tone-presets-import.ts`. Run `pnpm exec tsc --noEmit` inside `@feel-good/convex` and `pnpm build --filter=@feel-good/mirror`. Both must resolve the import. Remove the smoke file after the gate passes.

### Schema Changes

| Table   | Column          | Type                                                                                                                                                                      | Notes                                                                                                                                                                                                                              |
| ------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `users` | `personaPrompt` | `v.optional(v.union(v.string(), v.null()))` (widened from `v.optional(v.string())`)                                                                                       | Must stay optional while also allowing explicit `null` so existing rows can omit the field and clearing can set `null` via `ctx.db.patch`. Convex `patch` silently drops `undefined` keys, so `undefined` cannot be used to unset. |
| `users` | `tonePreset`    | `v.optional(v.union(v.literal("professional"), v.literal("friendly"), v.literal("witty"), v.literal("empathetic"), v.literal("direct"), v.literal("curious"), v.null()))` | New column; nullable to allow clearing                                                                                                                                                                                             |
| `users` | `topicsToAvoid` | `v.optional(v.union(v.string(), v.null()))`                                                                                                                               | New column; nullable to allow clearing                                                                                                                                                                                             |

**Patch-semantics decision (resolves ctx.db.patch / undefined issue):**
Convex `ctx.db.patch` treats `undefined` as "leave unchanged". To CLEAR a field, the mutation must pass `null`. All three persona fields are declared as `v.optional(v.union(<T>, v.null()))` so that:

- Undefined/absent = field never set (existing rows unaffected).
- `null` = explicitly cleared by the user.
- A concrete value = set.

The mutation signature:

```ts
args: {
  personaPrompt: v.optional(v.union(v.string(), v.null())),
  tonePreset: v.optional(v.union(v.literal("professional"), ..., v.null())),
  topicsToAvoid: v.optional(v.union(v.string(), v.null())),
}
```

Patch construction:

```ts
const patch: Record<string, unknown> = {};
if (args.personaPrompt !== undefined) patch.personaPrompt = args.personaPrompt;
if (args.tonePreset !== undefined) patch.tonePreset = args.tonePreset;
if (args.topicsToAvoid !== undefined) patch.topicsToAvoid = args.topicsToAvoid;
await ctx.db.patch("users", appUser._id, patch);
```

Client-side "Clear all customizations" sends `{ personaPrompt: null, tonePreset: null, topicsToAvoid: null }`. Save on a blank field sends `null` for that field. Save on unchanged fields omits them (react-hook-form dirty-field detection), which resolves to `undefined` at the mutation edge.

`loadStreamingContext` treats both `null` and empty string as "not set" for `personaPrompt` (falls back to `DEFAULT_PERSONA`).

### Files to Create

| Path                                                                       | Purpose                                                                                               |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `apps/mirror/features/profile-tabs/types.ts`                               | `PROFILE_TAB_KINDS`, `ProfileTabKind`, `PROFILE_TAB_LABELS`, `isProfileTabKind`, `getProfileTabHref`  |
| `packages/convex/convex/chat/tonePresets.ts`                               | `TONE_PRESETS` map, `TonePreset` type — single source of truth                                        |
| `packages/convex/convex/users/mutations.ts` (modify — add export)          | `updatePersonaSettings` mutation                                                                      |
| `apps/mirror/app/[username]/@content/clone-settings/page.tsx`              | Server component; owner-gate via `fetchAuthQuery` + `notFound()`; renders `<CloneSettingsPanel />`    |
| `apps/mirror/features/clone-settings/components/clone-settings-panel.tsx`  | Client component form host; uses `useQuery(getCurrentProfile)` + `useMutation(updatePersonaSettings)` |
| `apps/mirror/features/clone-settings/components/tone-preset-select.tsx`    | Controlled select; imports `TONE_PRESETS`                                                             |
| `apps/mirror/features/clone-settings/components/char-counter-textarea.tsx` | Textarea with counter element exposing `data-state` attribute                                         |
| `apps/mirror/features/clone-settings/components/clear-all-dialog.tsx`      | Confirmation dialog for "Clear all customizations"                                                    |
| `apps/mirror/features/clone-settings/lib/schemas/clone-settings.schema.ts` | Zod schema mirroring the Convex validator                                                             |
| `apps/mirror/tests/clone-settings/owner-sees-tab.spec.ts`                  | Playwright E2E                                                                                        |
| `apps/mirror/tests/clone-settings/non-owner-hidden-tab-and-404.spec.ts`    | Playwright E2E                                                                                        |
| `apps/mirror/tests/clone-settings/owner-edits-persona.spec.ts`             | Playwright E2E                                                                                        |
| `apps/mirror/tests/clone-settings/dirty-state-and-clear-all.spec.ts`       | Playwright E2E                                                                                        |
| `apps/mirror/tests/clone-settings/char-counter-thresholds.spec.ts`         | Playwright E2E                                                                                        |
| Unit test files (see Unit Tests section)                                   | Co-located `__tests__/*.test.ts(x)`                                                                   |

### Files to Modify

| Path                                                            | Change                                                                                                                                                                      |
| --------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/mirror/features/content/components/content-kind-tabs.tsx` | Rename to `apps/mirror/features/profile-tabs/components/profile-tabs.tsx`; iterate `PROFILE_TAB_KINDS`; filter `clone-settings` when `!isOwner` via `useProfileRouteData()` |
| `apps/mirror/app/[username]/_components/workspace-shell.tsx`    | Line 42 → `isProfileTabKind(segments[0])`; add `routeState` null branch                                                                                                     |
| `apps/mirror/app/[username]/_components/content-panel.tsx`      | Accept `routeState: ContentRouteState \| null`; skip scroll logic when null                                                                                                 |
| `apps/mirror/app/[username]/_components/mobile-workspace.tsx`   | Accept nullable `routeState`; skip scroll logic                                                                                                                             |
| `apps/mirror/hooks/use-profile-navigation-effects.ts`           | Guard scroll-memory branch on `routeState !== null`                                                                                                                         |
| `packages/convex/convex/users/schema.ts`                        | Widen `personaPrompt` to nullable; add `tonePreset` and `topicsToAvoid`                                                                                                     |
| `packages/convex/convex/users/helpers.ts`                       | Add new `currentProfileReturnValidator` containing `personaPrompt`, `tonePreset`, `topicsToAvoid`; leave `profileReturnValidator` untouched                                 |
| `packages/convex/convex/users/queries.ts`                       | `getCurrentProfile` returns the new validator; extend handler to include the three fields                                                                                   |
| `packages/convex/convex/users/mutations.ts`                     | Add `updatePersonaSettings` export                                                                                                                                          |
| `packages/convex/convex/chat/helpers.ts`                        | Update `loadStreamingContext`: prepend tone clause, append topics line                                                                                                      |
| `packages/convex/package.json`                                  | Add `./chat/tonePresets` to `exports` and `typesVersions`                                                                                                                   |

### Dependencies

None. No new `dependencies` or `devDependencies` entries in any `package.json`. All UI primitives come from `@feel-good/ui/primitives/*`. Form stack is existing react-hook-form + zod.

---

## Unit Tests

Co-located under `__tests__/`. Match repo's existing `.test.ts(x)` convention and runner. Confirm test runner (bun:test vs vitest) by inspecting a neighboring test file before adding new ones.

| ID    | File                                                                           | Case                                                                                                     | Verifies      |
| ----- | ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ------------- |
| UT-01 | `packages/convex/convex/chat/__tests__/tonePresets.test.ts`                    | `TONE_PRESETS` has exactly six keys matching the schema literal union                                    | NFR-06, FR-05 |
| UT-02 | `packages/convex/convex/chat/__tests__/helpers.test.ts`                        | `loadStreamingContext` with all fields composes in exact order with `\n\n` joins                         | FR-19         |
| UT-03 | `packages/convex/convex/chat/__tests__/helpers.test.ts`                        | Omits tone clause when `tonePreset` is null                                                              | FR-20         |
| UT-04 | `packages/convex/convex/chat/__tests__/helpers.test.ts`                        | Omits topics line when `topicsToAvoid` is null                                                           | FR-21         |
| UT-05 | `packages/convex/convex/chat/__tests__/helpers.test.ts`                        | Falls back to `DEFAULT_PERSONA` when `personaPrompt` is null or empty string                             | FR-10         |
| UT-06 | `packages/convex/convex/users/__tests__/updatePersonaSettings.test.ts`         | Throws on `personaPrompt` > 4000 chars before patch                                                      | FR-17         |
| UT-07 | `packages/convex/convex/users/__tests__/updatePersonaSettings.test.ts`         | Throws on `topicsToAvoid` > 500 chars before patch                                                       | FR-18         |
| UT-08 | `packages/convex/convex/users/__tests__/updatePersonaSettings.test.ts`         | Succeeds at boundary lengths (exactly 4000 / 500)                                                        | FR-07, FR-08  |
| UT-09 | `packages/convex/convex/users/__tests__/updatePersonaSettings.test.ts`         | Passing `null` clears the field in the DB row; passing `undefined` leaves it unchanged                   | FR-15, FR-24  |
| UT-10 | `packages/convex/convex/users/__tests__/getCurrentProfile.test.ts`             | Returns `personaPrompt`, `tonePreset`, `topicsToAvoid` to the authenticated caller                       | NFR-04        |
| UT-11 | `apps/mirror/features/clone-settings/__tests__/tone-preset-select.test.tsx`    | Renders all six preset labels                                                                            | FR-05         |
| UT-12 | `apps/mirror/features/clone-settings/__tests__/char-counter-textarea.test.tsx` | Counter exposes `data-state="warning"` at 80% of limit (3200/4000 and 400/500)                           | FR-09         |
| UT-13 | `apps/mirror/features/clone-settings/__tests__/char-counter-textarea.test.tsx` | Counter exposes `data-state="danger"` at ≥ limit                                                         | FR-07, FR-08  |
| UT-14 | `apps/mirror/features/clone-settings/__tests__/clone-settings-panel.test.tsx`  | Save button is disabled while mutation is pending                                                        | FR-13         |
| UT-15 | `apps/mirror/features/clone-settings/__tests__/clone-settings-panel.test.tsx`  | Form submits `{ tonePreset, personaPrompt, topicsToAvoid }`                                              | FR-11         |
| UT-16 | `apps/mirror/features/clone-settings/__tests__/clear-all-dialog.test.tsx`      | Dialog renders exact verbatim body string                                                                | FR-16         |
| UT-17 | `apps/mirror/features/profile-tabs/__tests__/types.test.ts`                    | `isProfileTabKind` returns true for all three kinds; false for unknowns                                  | —             |
| UT-18 | `apps/mirror/app/[username]/_components/__tests__/mobile-workspace.test.tsx`   | `routeState={null}` does not call `scrollContainer.scrollTo`                                             | FR-23         |
| UT-19 | `apps/mirror/features/clone-settings/__tests__/clone-settings.schema.test.ts`  | Zod: 4001 chars rejected; 4000 accepted; 501 topics rejected; 500 accepted; unknown tone preset rejected | FR-07, FR-08  |

---

## Playwright E2E Tests

Location: `apps/mirror/tests/clone-settings/`, suffix `.spec.ts`. Run via `pnpm --filter=@feel-good/mirror test:e2e`.

### `owner-sees-tab.spec.ts`

- Owner session → `/@owner` → Clone tab visible
- Click Clone → `data-testid="clone-settings-panel"` visible; URL contains `/clone-settings`
- Verifies: FR-01, FR-04

### `non-owner-hidden-tab-and-404.spec.ts`

- Non-owner session → `/@owner` → Clone tab absent
- Unauthenticated session → same assertion
- Non-owner navigates directly to `/@owner/clone-settings` → 404 rendered
- Unauthenticated direct navigation → 404 rendered
- Verifies: FR-02, FR-03, FR-25

### `owner-edits-persona.spec.ts`

- Owner → `/@owner/clone-settings` → select "Witty" → fill persona → fill topics → Save
- Reload → values persisted
- Seed `personaPrompt` → clear persona field only → Save → DB row has `personaPrompt: null` (backed by a query/assertion call)
- Verifies: FR-11, FR-12, FR-15, FR-24

### `dirty-state-and-clear-all.spec.ts`

- Seed all three fields → navigate → modify persona → click "Clear all customizations"
- Assert `role=alertdialog` visible; assert verbatim dialog body text
- Confirm → all fields empty
- Reload → all fields still empty
- Verifies: FR-14, FR-15, FR-16

### `char-counter-thresholds.spec.ts`

- Navigate → type 3200 chars → counter `data-state="warning"`
- Type to 4000 → counter `data-state="danger"`
- Attempt to exceed → blocked (either by `maxLength` or save disabled)
- Type 400 into topics → `warning`; 500 → `danger`
- Verifies: FR-07, FR-08, FR-09

---

## Anti-patterns (prohibited)

| Anti-pattern                                                                                            | Why                                                                                                                            |
| ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Adding `"clone-settings"` to `CONTENT_KINDS` / `ContentKind` / `isContentKind` / `getContentRouteState` | Cascades type breakage into `ContentRouteState`, `savedScrollTopByKind`, mobile redirect logic                                 |
| Reading `isOwner` from React context inside the server component `page.tsx`                             | Server components have no access to React context; use `fetchAuthQuery` instead (pattern at `app/[username]/layout.tsx:45-48`) |
| Adding persona fields to `publicProfileReturnValidator` or `getByUsername`                              | Leaks private config to every profile viewer                                                                                   |
| Adding persona fields to the pre-existing `profileReturnValidator`                                      | May be reused by other queries; create `currentProfileReturnValidator` instead                                                 |
| Using `undefined` in `ctx.db.patch` to unset a field                                                    | Convex silently drops `undefined` keys — unset paths must pass `null`                                                          |
| Inline tone-preset strings in UI code                                                                   | Breaks single source of truth; label/clause drift                                                                              |
| A `greeting` field that does not actually produce a greeting                                            | Violates the label's contract; deferred to a real v2 feature                                                                   |
| Injection regex advisory on owner-only input                                                            | Security theater for a single-owner editor                                                                                     |
| Rendering `SAFETY_PREFIX` in any UI element                                                             | Invites gaming; exposes operational infrastructure                                                                             |
| CSS color assertions in tests                                                                           | Fragile across themes; use `data-state` attribute assertions                                                                   |
| Widening `Record<ContentKind, number>` in scroll memory                                                 | Pollutes content-routing infrastructure with non-content routes                                                                |
| `setTimeout` for scroll or nav timing                                                                   | Not an architectural fix (AGENTS.md)                                                                                           |

---

## Team Orchestration Plan

### Phase A — Backend

**Tasks:**

1. Create `packages/convex/convex/chat/tonePresets.ts`.
2. Add `./chat/tonePresets` to `packages/convex/package.json` under `exports` and `typesVersions`.
3. Widen `personaPrompt` to nullable; add `tonePreset` and `topicsToAvoid` to `packages/convex/convex/users/schema.ts`.
4. Add `currentProfileReturnValidator` in `packages/convex/convex/users/helpers.ts`; extend `getCurrentProfile` to use it.
5. Implement `updatePersonaSettings` mutation in `packages/convex/convex/users/mutations.ts` with length guards and conditional patch construction.
6. Update `loadStreamingContext` in `packages/convex/convex/chat/helpers.ts` per composition order.
7. Write UT-01 through UT-10.
8. Add a temporary smoke-import file that imports `TONE_PRESETS` from `@feel-good/convex/chat/tonePresets` (cross-package path).

**Verification gate (all must pass):**

```bash
cd packages/convex && pnpm exec convex codegen
cd packages/convex && pnpm exec tsc --noEmit
pnpm build --filter=@feel-good/mirror   # consumer; also verifies smoke-import resolves
pnpm --filter=@feel-good/convex test     # run UT-01..UT-10 (adjust if convex package has no test script)
```

Remove the smoke-import file once the gate passes. Phase B does not start until the gate is green.

### Phase B — Frontend

**Prerequisites:** Phase A gate passed; `tonePresets` import path verified; mutation and query reachable.

**Tasks:**

1. Create `apps/mirror/features/profile-tabs/types.ts` and the unit tests (UT-17).
2. Rename `content-kind-tabs.tsx` → `profile-tabs.tsx` under new directory; refactor iteration + owner filter.
3. Modify `workspace-shell.tsx` (line 42 + routeState null branch).
4. Update `content-panel.tsx`, `mobile-workspace.tsx`, `use-profile-navigation-effects.ts` for nullable `routeState`.
5. Create `apps/mirror/app/[username]/@content/clone-settings/page.tsx` server component with `fetchAuthQuery` owner check and `notFound()`.
6. Build `CloneSettingsPanel`, `TonePresetSelect`, `CharCounterTextarea`, `ClearAllDialog`, zod schema.
7. Write UT-11 through UT-19 and all five Playwright specs.

**Verification gate (all must pass):**

```bash
pnpm build --filter=@feel-good/mirror
pnpm lint --filter=@feel-good/mirror
pnpm --filter=@feel-good/mirror test:e2e
```

---

## Open Questions

| ID    | Question                                                                                                                            | Default                                         |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| OQ-01 | Should v2 add a real first-message-injection feature (the cut `greeting` field, done right)?                                        | Defer; revisit after v1 owner feedback          |
| OQ-02 | Should `topicsToAvoid` become a tag/chip multi-select in v2?                                                                        | Defer; free text is sufficient for v1           |
| OQ-03 | Do we want a "Test in chat" button that opens a sandboxed chat session with unsaved values? Research flagged this as high-value UX. | Deferred from v1 scope; track as v2 enhancement |

---

## Adversarial Review Summary

| #   | Concern                                                                                       | Severity             | Resolution                                                                                                      |
| --- | --------------------------------------------------------------------------------------------- | -------------------- | --------------------------------------------------------------------------------------------------------------- |
| 1   | `CONTENT_KINDS` is the wrong abstraction; adding `clone-settings` cascades type breakage      | Critical             | **Accepted** — separate `PROFILE_TAB_KINDS` registry; content types untouched                                   |
| 2   | `hasContentRoute` panel gating must recognize settings without polluting `isContentKind`      | Critical             | **Accepted** — `workspace-shell.tsx` uses `isProfileTabKind`; `routeState` nulled for settings                  |
| 3   | Schema already has `personaPrompt`; new fields would collide                                  | Critical             | **Accepted** — `personaPrompt` retained as core field; only `tonePreset`, `topicsToAvoid` added; `greeting` cut |
| 4   | Wrong query targeted (`getCurrentProfile` is already owner-scoped)                            | Important            | **Accepted** — no access control added; return validator extended via new `currentProfileReturnValidator`       |
| 5   | `greeting` field label is a silent product lie                                                | Important            | **Accepted** — field cut from v1; deferred to OQ-01                                                             |
| 6   | Non-owner empty state is a UX footgun                                                         | Important            | **Accepted** — tab hidden entirely for non-owners; direct URL returns 404                                       |
| 7   | Mobile path unhandled                                                                         | Important            | **Accepted** — `MobileWorkspace` accepts nullable `routeState`; scroll restore gated                            |
| 8   | Convex-side length enforcement missing                                                        | Important            | **Accepted** — mutation throws before patch                                                                     |
| 9   | Tone preset UI/server drift is structural                                                     | Important            | **Accepted** — shared `tonePresets.ts` as single source of truth                                                |
| 10  | Injection advisory is security theater                                                        | Minor                | **Accepted** — removed entirely                                                                                 |
| 11  | "Reset to default" is mislabeled                                                              | Minor                | **Accepted** — "Clear all customizations" + verbatim dialog body                                                |
| 12  | Phase A build gate is toothless                                                               | Minor                | **Accepted** — gate now runs `convex codegen` + `tsc --noEmit` in the convex package + consumer build           |
| 13  | Server component cannot read React context for `isOwner`                                      | Critical (2nd pass)  | **Accepted** — server component uses `fetchAuthQuery` mirroring `app/[username]/layout.tsx:45-48`               |
| 14  | Cross-package import of `TONE_PRESETS` not validated                                          | Critical (2nd pass)  | **Accepted** — explicit `exports`/`typesVersions` entry + Phase A smoke-import step                             |
| 15  | `ctx.db.patch` silently drops `undefined` — "clear" path is broken                            | Important (2nd pass) | **Accepted** — fields made nullable; "clear" sends `null`; mutation builds conditional patch                    |
| 16  | `profileReturnValidator` may be shared; extending it may leak persona fields to other queries | Important (2nd pass) | **Accepted** — new `currentProfileReturnValidator` introduced; pre-existing validator untouched                 |

All Critical concerns resolved. All Important concerns resolved. No unresolved concerns remain before Phase 5 verification.
