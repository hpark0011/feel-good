# CSS Token File Convention (Living Document)

Last updated: 2026-02-21
Status: active
Scope: `packages/ui/src/styles/`

## Why

Token files in `packages/ui/src/styles/` follow a three-layer architecture (Radix → semantic → Tailwind). This convention makes it predictable where tokens live and how new ones should be added by establishing:

1. A fixed internal structure for every token file
2. A decision rule for when to create a new file vs. add to globals
3. A naming contract across all three layers

## Three-Layer Token Contract

Every design token must flow through all three layers. No exceptions.

```
Layer 1: Radix Color Scales (@radix-ui/colors)
  --gray-1..12, --red-1..12, etc. (imported by consuming apps)
    ↓
Layer 2: Semantic Custom Properties (:root / .dark)
  --primary, --background, --switch-checked, etc.
    ↓
Layer 3: Tailwind Registration (@theme inline)
  --color-primary: var(--primary) → enables bg-primary, text-primary
```

**Never define values directly in `@theme inline`.** Layer 3 must only contain `var()` references to Layer 2 properties. This ensures every token is overridable by consuming apps via `:root` / `.dark` blocks.

## File Internal Structure

Every component-specific token file follows this exact order:

```css
/*
* {filename}.css
*
* {Component}-specific styles and CSS variables
*/

:root {
  /* {Category} */
  --{component}-{property}: var(--{radix-step});
}

.dark {
  /* {Category} */
  --{component}-{property}: var(--{radix-step});
}

@theme inline {
  /* {Category} */
  --color-{component}-{property}: var(--{component}-{property});
}
```

Exceptions (no `:root` / `.dark` needed):
- `radix-color-scale.css` — Radix scales auto-switch via separate light/dark CSS imports
- `fonts.css` — Font family mappings are static

## Token Naming

### Layer 2 (semantic properties)

- Component-scoped tokens use a component prefix: `--input-*`, `--switch-*`, `--sidebar-*`, `--popover-*`
- System tokens used across many components have no prefix: `--background`, `--foreground`, `--border`, `--ring`
- States append to the token name: `--switch-checked-hover`, `--shadow-button-primary-hover`

### Layer 3 (Tailwind registration)

- Color tokens: `--color-{name}: var(--{name})`
- Shadow tokens: `--shadow-{name}: var(--shadow-{name})`
- Inset shadows: `--inset-shadow-{name}: var(--inset-shadow-{name})`
- Drop shadows: `--drop-shadow-{name}: var(--drop-shadow-{name})`
- Font tokens: `--font-{name}: var(--font-{css-variable})`

## File Split Rule

**A token group gets its own file when it is consumed exclusively by a single component file in `src/primitives/` or `src/components/`.**

Run this decision tree top-to-bottom. Stop at the first match:

1. **Is the token applied globally via `@layer base`?** → `globals.css`. Examples: `--border`, `--ring`, `--background`, `--foreground`.
2. **Is the token consumed by a single component?** Grep for its Tailwind utility (e.g., `bg-popover`, `text-switch-checked`). If every usage traces back to one primitive/component file → own file named `src/styles/{component}.css`.
3. **Is the token consumed by multiple unrelated components?** → `globals.css`. "Unrelated" means the components don't share a parent primitive (e.g., `--icon` is used by button, dropdown-menu, sidebar, dock-icon — no single owner).

When in doubt, grep. The answer is in the import graph, not in judgment.

### What belongs in `globals.css`

System-level tokens — consumed by `@layer base` or by multiple unrelated components:

- **Base**: `--background`, `--foreground` (applied to `body` in `@layer base`)
- **Border**: `--border`, `--border-subtle`, `--ring` (applied to `*` in `@layer base`)
- **Icon**: `--icon` (consumed by button, dropdown-menu, sidebar, dock-icon, and others)
- **Text**: `--information` (consumed across mirror articles, editor, and toolbar components)

Plus structural pieces: `@custom-variant dark`, `@layer base`, and all `@import` statements.

### What gets its own file

Tokens consumed exclusively by a single component — even if there's only one token (e.g., `field.css` has 1 token). The rule is semantic ownership, not count.

## Hub-and-Spoke Import Model

`globals.css` is the single entry point. It imports all other style files:

```css
@import "./fonts.css";
@import "./radix-color-scale.css";
@import "./shadows.css";
@import "./button.css";
@import "./dialog.css";
@import "./sidebar.css";
@import "./input.css";
@import "./switch.css";
@import "./field.css";
@import "./popover.css";
```

Consuming apps import only `@feel-good/ui/styles.css` (which resolves to `globals.css`). Individual style files are not imported directly.

## Dark Mode

Class-based only via `next-themes`:

```css
@custom-variant dark (&:is(.dark *));
```

No `prefers-color-scheme` media queries. The `ThemeProvider` sets `.dark` on `<html>`.

Every token file must define both `:root` (light) and `.dark` (dark) values, even when they're identical. This makes the dark mode contract explicit and tokens overridable per mode.

## Adding New Tokens

1. Grep for the Tailwind utility to determine if the token is consumed by one component or many
2. Single consumer → use or create `src/styles/{component}.css`
3. Multiple unrelated consumers or `@layer base` → add to `globals.css`
4. Follow the three-layer structure: `:root` → `.dark` → `@theme inline`
5. Never put values directly in `@theme inline`
6. If creating a new file, add `@import "./{name}.css";` to `globals.css`

## Special Files

| File | Role |
|------|------|
| `globals.css` | Hub. System tokens + imports + `@layer base` + `@custom-variant dark`. |
| `radix-color-scale.css` | Bridges Radix `--gray-1..12` etc. into Tailwind `@theme inline`. No `:root`/`.dark`. |
| `fonts.css` | Maps `next/font` CSS variables to `--font-sans`/`--font-serif`/`--font-mono`. No `:root`/`.dark`. |
| `shadows.css` | Cross-component shadow tokens (button, dock, shiny-button). Grouped by use case. |

## Lint Guard: No Direct Values in `@theme inline`

The primary drift risk is tokens defined directly in `@theme inline` (skipping Layer 2). This grep catches violations:

```bash
# Returns non-zero if any @theme inline block contains a value that isn't var(--...)
grep -Pzo '(?s)@theme inline\s*\{[^}]*\}' packages/ui/src/styles/*.css \
  | grep -P '--[\w-]+:\s*(?!var\()' \
  && echo "FAIL: direct values in @theme inline" && exit 1 \
  || echo "PASS: all @theme inline values use var()"
```

Run this as part of CI or as a pre-commit check. It catches exactly the violations found in `globals.css:137`, `globals.css:140`, and `sidebar.css:43-46`.

## Change Log

1. 2026-02-21: Initial convention. Established three-layer contract, grep-based file split rule, naming conventions, and `@theme inline` lint guard. Identified button and dialog tokens for extraction from globals.
