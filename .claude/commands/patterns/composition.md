---
name: Composition Pattern
category: Component Organization
applies_to: [components, features]
updated: 2025-01-13
documented_in: CLAUDE.md
---

# Feature Component Organization Pattern

Atomic component architecture with feature-based naming. Each component handles one specific aspect of the feature.

## Core Principles

1. **Single Responsibility**: One component = one purpose
2. **Smart Structure**: Flat for standalone; folders for 3+ related files
3. **Composition Over Nesting**: Compose in parent views, not nested folders
4. **Type Safety**: Strong TypeScript interfaces for all props
5. **Client/Server Separation**: `"use client"` only when needed (state, hooks, DOM)

## Naming Convention

**Pattern**: `{feature}-{component-name}.tsx`

**Examples**:

- `profile-name.tsx` → `ProfileName`
- `profile-header.tsx` → `ProfileHeader`
- `edit-profile-form.tsx` → `EditProfileForm` (forms/editing)
- `social-icon-links.tsx` → `SocialIconLinks` (utilities)

## Component Categories

### 1. Presentational

Display-only, no state/side effects. Can be server components.

```typescript
interface ProfileNameProps {
  name: string;
}

export function ProfileName({ name }: ProfileNameProps) {
  return <h1>{name}</h1>;
}
```

### 2. Container/Composite

Composes multiple child components. May have minimal UI state (dialogs, etc.). Often client components.

```typescript
"use client";

export function ProfileHeader({ slug, name }: ProfileHeaderProps) {
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  return (
    <>
      <ProfileWarning slug={slug} />
      <ProfileHistory slug={slug} />
      <ProfileShareSheet open={shareSheetOpen} onOpenChange={setShareSheetOpen} />
    </>
  );
}
```

### 3. Interactive/Form

State management, user input, side effects. Always client components.

```typescript
"use client";

export function EditProfileForm({ profile, slug }: EditProfileFormProps) {
  const form = useForm({ defaultValues: { name: profile.name } });
  return <Form {...form}>{/* fields */}</Form>;
}
```

### 4. Utility/Wrapper

Cross-cutting functionality (DOM manipulation, analytics, providers). Uses useEffect. Client components.

```typescript
"use client";

export function ProfileBackgroundWrapper({ children }: Props) {
  useEffect(() => {
    document.documentElement.classList.add("profile-page-bg");
    return () => document.documentElement.classList.remove("profile-page-bg");
  }, []);
  return <>{children}</>;
}
```

## Directory Structure

**Flat structure** for: standalone components, cross-feature components, single-purpose utilities

**Folder structure** for: component families (3+ files), shared configs, parent-child relationships

```
features/{feature-name}/
  components/
    {feature}-{component-name}.tsx      # Flat
    feature-family/                     # Folder (3+ files)
      feature-family.tsx
      feature-family-item.tsx
      feature-family.config.ts
  views/
    {feature}-view.tsx                  # Main composition
  hooks/
    use-{feature}-{hook-name}.tsx
```

## Folder Organization

**Create a folder when you have 3+ of:**
- Main component + sub-components used exclusively by it
- Configuration file (*.config.ts)
- Type definitions (*.types.ts)
- Related hooks

**Folder pattern:**
```
component-family/
  component-family.tsx           # Main
  component-family-item.tsx      # Sub-components
  component-family.config.ts     # Config
  index.ts                       # export { ComponentFamily } from "./component-family"
```

**Real examples:**
- `project-select/` - Main + menu items + dialogs + color indicator
- `sub-tasks/` - List + rows + editor + 10 specialized sub-components + types
- `ticket-card/` - Card + timer button + toolbar + tag + form dialog + config

## Composition Pattern

Compose components in `views/{feature}-view.tsx`:

```typescript
import { FeatureComponentA } from "../components/feature-component-a";
import { FeatureComponentB } from "../components/feature-component-b";

export default function FeatureView({ data }: FeatureViewProps) {
  return (
    <div>
      <FeatureComponentA prop={data.propA} />
      <FeatureComponentB prop={data.propB} />
    </div>
  );
}
```

**Key**: Import from `components/`, compose in view, pass props down, keep view focused on composition.

## Component Structure Template

```typescript
// 1. Imports (external → internal)
import { ExternalLib } from "external-lib";
import { LocalComponent } from "./local-component";

// 2. Types (if needed)
type SomeType = RouterOutputs["feature"]["getData"];

// 3. Props interface
interface ComponentNameProps {
  requiredProp: string;
  optionalProp?: number;
}

// 4. Component
export function ComponentName({ requiredProp, optionalProp }: ComponentNameProps) {
  if (!requiredProp) return null; // Early return

  const processedData = processData(requiredProp);

  return <div>{/* JSX */}</div>;
}
```

## Guidelines for AI Agents

### Creating Components

1. **Determine Type**: Presentational (no client) → Interactive (client + hooks) → Container (composes) → Utility (side effects)
2. **Naming**: `{feature}-{name}.tsx`, function matches file (PascalCase), prefix `edit-` for forms
3. **Structure**: Props interface first, early returns, single responsibility, named export
4. **Type Safety**: Always `ComponentNameProps` interface, use tRPC types, avoid `any`

### Refactoring

1. Check naming follows pattern
2. Extract logic to hooks/utils
3. Split multi-purpose components
4. Add type safety
5. Optimize client/server usage

### Common Patterns

**Conditional**: `if (!data) return null;`

**Composing**: `{items.map(item => <ChildComponent key={item.id} data={item} />)}`

**State**: `"use client"` + `useState`/`useForm`/hooks

## Examples

See `apps/frontend/src/features/profile/components/`:

- **Presentational**: `profile-name.tsx`, `profile-bio.tsx`
- **Container**: `profile-header.tsx`, `profile-socials.tsx`
- **Interactive**: `profile-chat-input.tsx`
- **Form**: `edit-profile-form.tsx`
- **Utility**: `profile-background-wrapper.tsx`

Composition: `apps/frontend/src/features/profile/views/profile-view.tsx`

## Benefits & Anti-Patterns

**Benefits**: Discoverability, reusability, maintainability, testability, scalability, AI-friendly

**Avoid**:

- ❌ Single-file folders: `profile/header/header.tsx` → ✅ Flat: `profile-header.tsx` OR ✅ Folder with 3+ files: `profile-header/`
- ❌ Generic names: `button.tsx` → ✅ Feature prefix: `profile-button.tsx`
- ❌ Mixed concerns: display + edit → ✅ Separate: `profile-bio.tsx` + `edit-profile-bio.tsx`
- ❌ Skipped types: `props: any` → ✅ Interface: `interface ComponentProps`
- ❌ Unnecessary client → ✅ Client only for state/hooks/DOM

## Checklist

- [ ] Name: `{feature}-{name}.tsx` pattern
- [ ] Function name matches file (PascalCase)
- [ ] Props interface defined (`ComponentNameProps`)
- [ ] Single responsibility
- [ ] `"use client"` only if needed
- [ ] Early returns for null/empty
- [ ] Named export
- [ ] Types properly defined
- [ ] Composed in parent view (not nested)
