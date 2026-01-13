# Feature Component Organization Pattern

This document defines the standard organization pattern for feature components in the Delphi codebase. This pattern promotes maintainability, discoverability, and consistency across all features.

## Overview

Features should organize their components using an **atomic component architecture** with **feature-based naming**. Each component is a single, focused piece of UI that handles one specific aspect of the feature.

## Core Principles

1. **Single Responsibility**: Each component handles one specific aspect of the feature
2. **Flat Structure**: All components exist at the same directory level (no nested component folders)
3. **Composition Over Nesting**: Components are composed in parent views rather than deeply nested
4. **Type Safety**: All components use strong TypeScript interfaces for props
5. **Client/Server Separation**: Use `"use client"` only when necessary (state, hooks, DOM manipulation)

## Naming Convention

### Standard Pattern
```
{feature}-{component-name}.tsx
```

### Examples
- `profile-name.tsx` → `ProfileName` component
- `profile-bio.tsx` → `ProfileBio` component
- `profile-header.tsx` → `ProfileHeader` component
- `mind-widget.tsx` → `MindWidget` component
- `mind-training-status.tsx` → `MindTrainingStatus` component

### Edit/Form Components
For components that handle editing or forms, prefix with `edit-`:
- `edit-profile-form.tsx` → `EditProfileForm` component
- `edit-profile-socials.tsx` → `EditProfileSocials` component
- `edit-mind-settings.tsx` → `EditMindSettings` component

### Utility/Helper Components
For shared utility components within a feature, use descriptive names:
- `social-icon-links.tsx` → `SocialIconLinks` component
- `profile-custom-input.tsx` → `ProfileCustomInput` component

## Component Categories

### 1. Presentational Components
**Purpose**: Simple, display-only components with minimal logic

**Characteristics**:
- No state management
- No side effects
- Pure rendering based on props
- Can be server components (no `"use client"`)

**Example**:
```typescript
interface ProfileNameProps {
  name: string;
}

export function ProfileName({ name }: ProfileNameProps) {
  return (
    <h1 className="text-[52px] mt-6 mb-3 font-semibold text-sand-12">
      {name}
    </h1>
  );
}
```

**When to use**: Displaying static or prop-driven content

---

### 2. Container/Composite Components
**Purpose**: Components that compose other components together

**Characteristics**:
- Imports and uses multiple child components
- Handles layout and composition
- May include minimal state for UI concerns (e.g., dialog open/close)
- Often client components due to interactivity

**Example**:
```typescript
"use client";

import { ProfileHistory } from "./profile-history";
import { ProfileShareSheet } from "./profile-share-sheet";
import { ProfileWarning } from "./profile-warning";

interface ProfileHeaderProps {
  slug: string;
  name: string;
}

export function ProfileHeader({ slug, name }: ProfileHeaderProps) {
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  
  return (
    <>
      <ProfileWarning slug={slug} />
      <header>
        <ProfileHistory slug={slug} />
        <button onClick={() => setShareSheetOpen(true)}>Share</button>
      </header>
      <ProfileShareSheet open={shareSheetOpen} onOpenChange={setShareSheetOpen} />
    </>
  );
}
```

**When to use**: Combining multiple components into a cohesive UI section

---

### 3. Interactive/Form Components
**Purpose**: Components with state management and user interactions

**Characteristics**:
- Uses React hooks (useState, useEffect, etc.)
- Handles form state or user input
- Manages side effects
- Always client components (`"use client"`)

**Example**:
```typescript
"use client";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";

interface EditProfileFormProps {
  profile: Profile;
  slug: string;
}

export function EditProfileForm({ profile, slug }: EditProfileFormProps) {
  const form = useForm({ defaultValues: { name: profile.name } });
  const mutation = useMutation(/* ... */);
  
  return (
    <Form {...form}>
      {/* form fields */}
    </Form>
  );
}
```

**When to use**: Forms, inputs, interactive elements requiring state

---

### 4. Utility/Wrapper Components
**Purpose**: Components that provide cross-cutting functionality

**Characteristics**:
- Handles side effects (DOM manipulation, analytics, etc.)
- Wraps other components
- Often uses useEffect for lifecycle management
- Client components

**Example**:
```typescript
"use client";

import { useEffect } from "react";

interface ProfileBackgroundWrapperProps {
  children: React.ReactNode;
}

export function ProfileBackgroundWrapper({ children }: ProfileBackgroundWrapperProps) {
  useEffect(() => {
    document.documentElement.classList.add("profile-page-bg");
    return () => {
      document.documentElement.classList.remove("profile-page-bg");
    };
  }, []);

  return <>{children}</>;
}
```

**When to use**: Analytics tracking, DOM manipulation, theme/context providers

---

## Directory Structure

```
features/
  {feature-name}/
    components/
      {feature}-{component-name}.tsx
      {feature}-{another-component}.tsx
      edit-{feature}-{form-name}.tsx
    views/
      {feature}-view.tsx  # Main composition component
    hooks/
      use-{feature}-{hook-name}.tsx
    lib/
      utils.ts  # Feature-specific utilities
    styles/
      theme.css  # Feature-specific styles
```

## Composition Pattern

Components should be composed in a parent view component located in `views/{feature}-view.tsx`:

```typescript
import { FeatureComponentA } from "../components/feature-component-a";
import { FeatureComponentB } from "../components/feature-component-b";
import { FeatureComponentC } from "../components/feature-component-c";

interface FeatureViewProps {
  data: FeatureData;
  // other props
}

export default function FeatureView({ data }: FeatureViewProps) {
  return (
    <div className="feature-container">
      <FeatureComponentA prop={data.propA} />
      <FeatureComponentB prop={data.propB} />
      <FeatureComponentC prop={data.propC} />
    </div>
  );
}
```

**Key Points**:
- Import components directly from `components/`
- Compose them in a logical order
- Pass props down from the view component
- Keep the view component focused on composition, not business logic

## Component Structure Template

```typescript
// 1. Imports (external libraries first, then internal)
import { SomeExternalLib } from "external-lib";
import { ComponentFromUI } from "@delphi/ui";
import { LocalComponent } from "./local-component";
import { utilityFunction } from "../lib/utils";

// 2. Type definitions (if needed)
type SomeType = RouterOutputs["feature"]["getData"];

// 3. Props interface
interface ComponentNameProps {
  requiredProp: string;
  optionalProp?: number;
}

// 4. Component implementation
export function ComponentName({ 
  requiredProp, 
  optionalProp 
}: ComponentNameProps) {
  // Early returns for null/empty states
  if (!requiredProp) return null;

  // Component logic
  const processedData = processData(requiredProp);

  // Render
  return (
    <div className="component-wrapper">
      {/* JSX */}
    </div>
  );
}
```

## Guidelines for AI Agents

When creating or refactoring components following this pattern:

### Creating New Components

1. **Determine Component Type**: 
   - Is it presentational? → No `"use client"`, simple props
   - Does it need state/interactivity? → Add `"use client"`, use hooks
   - Does it compose others? → Import child components
   - Does it handle side effects? → Use useEffect, mark as client

2. **Naming**:
   - Use `{feature}-{descriptive-name}.tsx` format
   - Component function name should match file name (PascalCase)
   - For edit forms, prefix with `edit-`

3. **Structure**:
   - Define props interface first
   - Add early returns for null/empty states
   - Keep component focused on single responsibility
   - Export as named export: `export function ComponentName`

4. **Type Safety**:
   - Always define `ComponentNameProps` interface
   - Use TypeScript types from tRPC outputs when possible
   - Avoid `any` types

### Refactoring Existing Components

1. **Check Naming**: Ensure it follows `{feature}-{name}.tsx` pattern
2. **Extract Logic**: Move complex logic to hooks or utility functions
3. **Split Large Components**: Break down components that do multiple things
4. **Add Type Safety**: Ensure all props are properly typed
5. **Optimize Client/Server**: Only mark as client if necessary

### Common Patterns

**Conditional Rendering**:
```typescript
export function Component({ data }: ComponentProps) {
  if (!data) return null; // Early return
  
  return <div>{data}</div>;
}
```

**Composing Components**:
```typescript
export function ContainerComponent({ items }: Props) {
  return (
    <div>
      {items.map(item => (
        <ChildComponent key={item.id} data={item} />
      ))}
    </div>
  );
}
```

**Client Component with State**:
```typescript
"use client";

import { useState } from "react";

export function InteractiveComponent({ initialValue }: Props) {
  const [value, setValue] = useState(initialValue);
  
  return (
    <input 
      value={value} 
      onChange={(e) => setValue(e.target.value)} 
    />
  );
}
```

## Examples from Codebase

### Reference Implementation
See `apps/frontend/src/features/profile/components/` for a complete implementation of this pattern:

- **Presentational**: `profile-name.tsx`, `profile-bio.tsx`, `profile-image.tsx`
- **Container**: `profile-header.tsx`, `profile-socials.tsx`
- **Interactive**: `profile-chat-input.tsx`, `profile-custom-input.tsx`
- **Form**: `edit-profile-form.tsx`, `edit-profile-socials.tsx`
- **Utility**: `profile-background-wrapper.tsx`, `profile-tracker.tsx`

### Composition Example
See `apps/frontend/src/features/profile/views/profile-view.tsx` for how components are composed together.

## Benefits

1. **Discoverability**: Easy to find components by feature name
2. **Reusability**: Small, focused components are easier to reuse
3. **Maintainability**: Changes are isolated to specific components
4. **Testability**: Each component can be tested independently
5. **Scalability**: New features can be added without affecting existing ones
6. **AI-Friendly**: Clear patterns make it easier for AI agents to generate consistent code

## Anti-Patterns to Avoid

❌ **Don't nest component folders**: `components/profile/header/header.tsx`
✅ **Do use flat structure**: `components/profile-header.tsx`

❌ **Don't create generic names**: `components/button.tsx` (unless it's truly shared)
✅ **Do use feature prefix**: `components/profile-button.tsx`

❌ **Don't mix concerns**: A component that both displays and edits
✅ **Do separate concerns**: `profile-bio.tsx` and `edit-profile-bio.tsx`

❌ **Don't skip type definitions**: `function Component(props: any)`
✅ **Do define interfaces**: `interface ComponentProps { ... }`

❌ **Don't mark everything as client**: `"use client"` on presentational components
✅ **Do use client only when needed**: State, hooks, DOM manipulation

## Checklist for New Components

- [ ] Component name follows `{feature}-{name}.tsx` pattern
- [ ] Component function name matches file name (PascalCase)
- [ ] Props interface is defined (`ComponentNameProps`)
- [ ] Component has single responsibility
- [ ] `"use client"` is only added if necessary
- [ ] Early returns for null/empty states
- [ ] Exported as named export
- [ ] TypeScript types are properly defined
- [ ] Component is composed in parent view (not nested)

