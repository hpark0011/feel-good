# Page-View-Providers Pattern

This document defines the standard three-layer architecture pattern for organizing feature pages in the Delphi codebase. This pattern ensures clean separation between server-side data fetching, client-side providers, and view composition.

## Overview

Features should follow a **three-layer architecture**:
1. **`page.tsx`** (Server Component) - Handles data fetching
2. **`{feature}-providers.tsx`** (Client Component) - Contains only providers
3. **`{feature}-view.tsx`** (Client Component) - Contains all logic and composition

## Architecture Pattern

```
page.tsx (server)
  ↓
{feature}-providers.tsx (client wrapper - providers only)
  ↓
{feature}-view.tsx (client - all logic and composition)
```

## Layer Responsibilities

### 1. `page.tsx` - Server Component

**Location**: `apps/{app}/src/app/{route}/page.tsx`

**Responsibilities**:
- Fetch all data using tRPC, API calls, or server-side functions
- Handle feature flags and configuration
- Pass all data as props to the view
- Wrap the view with providers wrapper

**Characteristics**:
- Server Component (no `"use client"`)
- Async function
- Can use `await` for data fetching
- No client-side hooks or state
- No side effects

**Example**:
```typescript
import type { Metadata } from "next";
import { HomepageProviders } from "./dynamic-homepage/components/homepage-providers";
import HomepageView from "./dynamic-homepage/views/homepage-view";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // Fetch all data
  const trpc = await createTRPCCaller(AppId.STUDIO);
  const cloneData = await trpc.clone.fetchCloneBySlug({ slug });
  const trainingUsage = await fetchTrainingUsage(slug);
  
  // Handle feature flags
  const isNewHomepageEnabled = await enableNewHomepage();
  
  // Compute derived values
  const firstName = cloneData.clone.name?.split(" ")[0];
  const isFreeTier = cloneData.clone.tierConfig?.tier === "FREE";
  
  return (
    <HomepageProviders>
      <HomepageView
        firstName={firstName}
        isFreeTier={isFreeTier}
        trainingUsage={trainingUsage}
        isNewHomepageEnabled={isNewHomepageEnabled}
      />
    </HomepageProviders>
  );
}
```

**Reference**: `apps/studio/src/app/[slug]/(dashboard)/page.tsx`

---

### 2. `{feature}-providers.tsx` - Client Provider Wrapper

**Location**: `{feature}/components/{feature}-providers.tsx`

**Responsibilities**:
- Wrap the view with all necessary React Context providers
- Include UI elements that require providers (modals, widgets, etc.)
- **NO business logic or side effects**
- **NO data fetching or state management**

**Characteristics**:
- Client Component (`"use client"`)
- Minimal wrapper - only providers
- Uses hooks only for accessing context (e.g., `useCloneContext`, `useSlug`)
- No `useEffect`, `useState`, or other side effects
- No data fetching

**Example**:
```typescript
"use client";

import { useCloneContext } from "@/lib/state/clone-context";
import { AddContentProvider } from "@/lib/state/studio/add-content";
import { MindDialogProvider } from "../mind-widget/components/mind-dialog";
import { SmallMindWidget } from "../mind-widget/components/small-mind-widget";
import { TrainingQueueProvider } from "../mind-widget/hooks/use-training-queue";
import { useSlug } from "../hooks/useSlug";
import { AddContentModal } from "@/app/[slug]/(dashboard)/mind/_components/add";

interface HomepageProvidersProps {
  children: React.ReactNode;
}

export function HomepageProviders({ children }: HomepageProvidersProps) {
  const { clone } = useCloneContext();
  const slug = useSlug();

  return (
    <>
      <AddContentProvider clone={{ id: clone.id, slug }}>
        <TrainingQueueProvider>
          <MindDialogProvider>
            <div className="absolute top-3 w-full flex justify-center left-0">
              <SmallMindWidget />
            </div>
            {children}
            <AddContentModal />
          </MindDialogProvider>
        </TrainingQueueProvider>
      </AddContentProvider>
    </>
  );
}
```

**Reference**: `apps/studio/src/app/[slug]/(dashboard)/dynamic-homepage/components/homepage-providers.tsx`

**What NOT to include**:
- ❌ Side effects (`useEffect` for analytics, navigation, etc.)
- ❌ Data fetching (`useQuery`, `useTRPC`, etc.)
- ❌ State management (`useState`, `useReducer`, etc.)
- ❌ Business logic (auto-complete paths, transition tracking, etc.)

---

### 3. `{feature}-view.tsx` - Client View Component

**Location**: `{feature}/views/{feature}-view.tsx`

**Responsibilities**:
- Contains all client-side logic and side effects
- Composes child components
- Handles analytics tracking
- Manages navigation events
- Contains all business logic

**Characteristics**:
- Client Component (`"use client"`)
- Uses hooks for state, effects, and data fetching
- Contains all `useEffect` hooks for side effects
- Composes child components from `components/` directory
- Receives all data as props from `page.tsx`

**Example**:
```typescript
"use client";

import { useEffect, useRef } from "react";
import { useActivePath } from "../hooks/useActivePath";
import { usePaths } from "../hooks/use-paths";
import { usePathTransitionTracker } from "../hooks/usePathTransitionTracker";
import { usePathAnalyticsTrackingInit } from "../components/path-analytics-tracker";
import { HomepageHeaderSection } from "../components/homepage-header-section";
import { HomepagePathsSection } from "../components/homepage-paths-section";

interface HomepageViewProps {
  firstName: string | undefined;
  isFreeTier: boolean;
  trainingUsage: TrainingUsage;
  // ... other props
}

export default function HomepageView({
  firstName,
  isFreeTier,
  trainingUsage,
}: HomepageViewProps) {
  const slug = useSlug();
  const activePath = useActivePath();
  const { paths } = usePaths();
  const { clone } = useCloneContext();

  // Initialize analytics tracking
  usePathAnalyticsTrackingInit();

  // Track path transitions
  usePathTransitionTracker({
    slug,
    activePath: activePath || undefined,
    paths: paths || [],
    // ...
  });

  // Auto-complete path logic
  useEffect(() => {
    // Side effect logic
  }, [/* deps */]);

  // Handle navigation events
  useEffect(() => {
    const handlePopstate = () => {
      // Navigation logic
    };
    window.addEventListener("popstate", handlePopstate);
    return () => {
      window.removeEventListener("popstate", handlePopstate);
    };
  }, [/* deps */]);

  return (
    <>
      <HomepageHeaderSection firstName={firstName} />
      <HomepagePathsSection isFreeTier={isFreeTier} />
      {/* ... other components */}
    </>
  );
}
```

**Reference**: `apps/studio/src/app/[slug]/(dashboard)/dynamic-homepage/views/homepage-view.tsx`

**What to include**:
- ✅ All `useEffect` hooks for side effects
- ✅ Analytics tracking initialization
- ✅ Navigation event handlers
- ✅ Business logic (auto-complete, transitions, etc.)
- ✅ Component composition
- ✅ Client-side data fetching if needed (`useQuery`, `useTRPC`, etc.)

---

## Directory Structure

```
{feature}/
  components/
    {feature}-providers.tsx  # Provider wrapper
    {feature}-{component-name}.tsx  # Child components
  views/
    {feature}-view.tsx  # Main view component
  hooks/
    use-{feature}-{hook-name}.tsx
```

**Example**:
```
dynamic-homepage/
  components/
    homepage-providers.tsx
    homepage-header-section.tsx
    homepage-paths-section.tsx
  views/
    homepage-view.tsx
  hooks/
    use-paths.ts
    useActivePath.ts
```

---

## Key Principles

### 1. Separation of Concerns
- **Server**: Data fetching only
- **Providers**: Context providers only
- **View**: All client-side logic

### 2. Data Flow
- Data flows **down** from `page.tsx` → `{feature}-view.tsx` via props
- Never fetch data in providers wrapper
- View can fetch additional client-side data if needed

### 3. Side Effects Location
- **Analytics tracking**: `{feature}-view.tsx`
- **Navigation handlers**: `{feature}-view.tsx`
- **Auto-complete logic**: `{feature}-view.tsx`
- **NOT in providers wrapper**

### 4. Provider Wrapper Minimalism
- Providers wrapper should be **as thin as possible**
- Only include providers that are required for the entire feature
- If a provider is only needed by one component, move it closer to that component

---

## Common Patterns

### Pattern 1: Simple Feature (No Providers Needed)
If a feature doesn't need providers, skip the providers wrapper:

```typescript
// page.tsx
export default async function Page() {
  const data = await fetchData();
  return <FeatureView data={data} />;
}
```

### Pattern 2: Feature with Providers
Most features will need providers:

```typescript
// page.tsx
export default async function Page() {
  const data = await fetchData();
  return (
    <FeatureProviders>
      <FeatureView data={data} />
    </FeatureProviders>
  );
}
```

### Pattern 3: Feature with Multiple Providers
Nest providers in the providers wrapper:

```typescript
// {feature}-providers.tsx
export function FeatureProviders({ children }: Props) {
  return (
    <ProviderA>
      <ProviderB>
        <ProviderC>
          {children}
        </ProviderC>
      </ProviderB>
    </ProviderA>
  );
}
```

---

## Anti-Patterns to Avoid

❌ **Don't put side effects in providers wrapper**:
```typescript
// WRONG
export function HomepageProviders({ children }: Props) {
  useEffect(() => {
    // Analytics tracking - WRONG!
  }, []);
  return <Provider>{children}</Provider>;
}
```

✅ **Do put side effects in view**:
```typescript
// CORRECT
export default function HomepageView() {
  useEffect(() => {
    // Analytics tracking - CORRECT!
  }, []);
  return <div>...</div>;
}
```

❌ **Don't fetch data in providers wrapper**:
```typescript
// WRONG
export function HomepageProviders({ children }: Props) {
  const { data } = useTRPC.query.getData(); // WRONG!
  return <Provider>{children}</Provider>;
}
```

✅ **Do fetch data in page.tsx or view**:
```typescript
// CORRECT - in page.tsx
export default async function Page() {
  const data = await trpc.getData(); // CORRECT!
  return <HomepageProviders><HomepageView data={data} /></HomepageProviders>;
}
```

❌ **Don't create unnecessary pass-through components**:
```typescript
// WRONG - unnecessary wrapper
export default function HomepageContent(props: Props) {
  return <HomepageView {...props} />;
}
```

✅ **Do use view directly from page.tsx**:
```typescript
// CORRECT
export default async function Page() {
  return <HomepageProviders><HomepageView {...props} /></HomepageProviders>;
}
```

---

## Reference Examples

### Profile Feature
- **Page**: `apps/frontend/src/app/(clone)/[slug]/(views)/page.tsx`
- **Providers**: `apps/frontend/src/features/profile/components/profile-background-wrapper.tsx`
- **View**: `apps/frontend/src/features/profile/views/profile-view.tsx`

### Homepage Feature
- **Page**: `apps/studio/src/app/[slug]/(dashboard)/page.tsx`
- **Providers**: `apps/studio/src/app/[slug]/(dashboard)/dynamic-homepage/components/homepage-providers.tsx`
- **View**: `apps/studio/src/app/[slug]/(dashboard)/dynamic-homepage/views/homepage-view.tsx`

---

## Checklist for New Features

When creating a new feature following this pattern:

- [ ] `page.tsx` fetches all server-side data
- [ ] `page.tsx` passes all data as props to view
- [ ] `{feature}-providers.tsx` contains only providers (no side effects)
- [ ] `{feature}-providers.tsx` wraps the view
- [ ] `{feature}-view.tsx` contains all client-side logic
- [ ] `{feature}-view.tsx` receives all data via props
- [ ] No unnecessary pass-through components
- [ ] Side effects are in the view, not providers wrapper
- [ ] Data fetching is in page.tsx or view, not providers wrapper

---

## Guidelines for AI Agents

When implementing or refactoring features:

1. **Identify the three layers**: Determine what goes in `page.tsx`, `{feature}-providers.tsx`, and `{feature}-view.tsx`

2. **Start with page.tsx**: Fetch all data server-side, then pass to view

3. **Create providers wrapper**: Only if providers are needed, keep it minimal

4. **Build the view**: Put all client-side logic, side effects, and composition here

5. **Avoid pass-through components**: Use the view directly from page.tsx

6. **Keep providers thin**: If you find yourself adding logic to providers wrapper, move it to the view

7. **Follow data flow**: Data flows down via props, never up

