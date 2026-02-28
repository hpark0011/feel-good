---
name: add-ui-factory-component
description: Scaffold a new component showcase page in the UI Factory app. Creates page and _components/ files, updates navigation config, and verifies the build. Invoke with /add-ui-factory-component <component-name>.
---

# Add UI Factory Component

You scaffold a new component showcase page in `apps/ui-factory/` following the established file structure and patterns.

## Input

The user provides a component name (e.g., `checkbox`, `badge`, `tooltip`). This maps to a primitive at `packages/ui/src/primitives/{name}.tsx`.

## Steps

### 1. Validate the primitive exists

Check that `packages/ui/src/primitives/{name}.tsx` exists. If it doesn't, list available primitives and ask the user to pick one.

Also check that `apps/ui-factory/app/components/{name}/` does NOT already exist. If it does, tell the user and stop.

### 2. Read the primitive source

Read `packages/ui/src/primitives/{name}.tsx` to discover:
- All exported components (named exports)
- Variant definitions (look for `variants` in `cva()` or `tv()` calls, or a `variants` object)
- Size definitions (look for `size` in variant configs)
- Any props that affect visual appearance (e.g., `disabled`, `checked`, `direction`)

This is the most important step. The variants file should showcase the real API of the component, not a generic placeholder.

### 3. Create 3 files

All three files go under `apps/ui-factory/app/components/{name}/`.

**`page.tsx`**
```tsx
import { {Name}View } from "./_components/{name}-view";

export default function {Name}Page() {
  return <{Name}View />;
}
```

**`_components/{name}-view.tsx`**
```tsx
import { {Name}Variants } from "./{name}-variants";

export function {Name}View() {
  return <{Name}Variants />;
}
```

**`_components/{name}-variants.tsx`**

This file is NOT a static template. Generate it by reading the primitive source. Follow these rules:

- Import `PageSection`, `PageSectionHeader`, `Divider` from `@/components/` (see imports below)
- Import the component(s) from `@feel-good/ui/primitives/{name}`
- Wrap everything in `<div className="flex flex-col w-full">`
- For each variant/size/state combination, create a `<Divider />` + `<PageSection>` + `<PageSectionHeader>` block
- Use descriptive headers like `Variant: Default`, `Size: Small`, `State: Disabled`
- If the component requires interactivity (e.g., Drawer needs a trigger), add `"use client"` and minimal state
- If the component is complex (e.g., has sub-components like `DrawerContent`, `DrawerTrigger`), compose them properly
- Keep the showcase focused on visual variants, not exhaustive API coverage

Standard imports for the variants file:
```tsx
import { PageSection } from "@/components/page-section";
import { PageSectionHeader } from "@/components/page-section-header";
import { Divider } from "@/components/divider";
```

### 4. Update navigation config

In `apps/ui-factory/config/navigation.config.ts`, add a new entry to `COMPONENT_NAV_ITEMS`:

```ts
{ label: "{Label}", href: "/components/{name}" },
```

- Insert in alphabetical order by label
- Label is the display name (e.g., `Checkbox`, `Badge`, `Alert Dialog`)
- href matches the folder name under `app/components/`

### 5. Verify the build

Run:
```bash
pnpm build --filter=@feel-good/ui-factory
```

If the build fails, read the error output and fix the generated files. Common issues:
- Missing `"use client"` directive for components that use hooks or event handlers
- Importing non-existent exports from the primitive
- Missing sub-component imports

## Naming Conventions

| Token | Example (`checkbox`) | Example (`alert-dialog`) |
|-------|---------------------|-------------------------|
| `{name}` | `checkbox` | `alert-dialog` |
| `{Name}` | `Checkbox` | `AlertDialog` |
| `{Label}` | `Checkbox` | `Alert Dialog` |

- `{name}` = kebab-case, matches the primitive filename
- `{Name}` = PascalCase, used for component/function names
- `{Label}` = Title Case with spaces, used for nav label and section headers

## Reference Files

| File | Purpose |
|------|---------|
| `packages/ui/src/primitives/{name}.tsx` | Source of truth for component API |
| `apps/ui-factory/config/navigation.config.ts` | Nav config to update |
| `apps/ui-factory/app/components/switch/` | Simple component example (variants + sizes) |
| `apps/ui-factory/app/components/input/` | Component with sub-components (Field, FieldLabel) |
| `apps/ui-factory/app/components/drawer/` | Complex interactive component example |

## Pattern Examples

**Simple component (switch):** Each variant/size gets its own PageSection.

**Component with Field wrappers (input):** Shows standalone usage and composed with Field/FieldLabel/FieldDescription.

**Interactive component (drawer):** Uses `"use client"`, manages state, shows each direction as a section. Extracts complex sub-demos into separate files in `_components/`.

Match the complexity of your output to the complexity of the primitive being showcased.
