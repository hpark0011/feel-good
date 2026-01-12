# Refactor Page: Data Fetching Separation Pattern

This command refactors a Next.js page to follow the **Server Component + Client View Pattern**, ensuring clean separation between data fetching and UI rendering.

## Pattern Overview

Separate page components into two layers:

1. **`page.tsx`** (Server Component) - Handles all data fetching
2. **`{feature}-view.tsx`** (Client Component) - Handles all UI composition

```
page.tsx (Server Component - data fetching only)
  ↓
{feature}-view.tsx (Client Component - UI composition only)
```

## When to Use This Pattern

- ✅ Page needs server-side data fetching
- ✅ Page has client-side interactivity (hooks, state, effects)
- ✅ Page doesn't need React Context providers (use Page-View-Providers pattern instead)
- ✅ You want to leverage Next.js Server Components for data fetching

## Refactoring Steps

### Step 1: Create the View Component

Create `app/{route}/_components/{feature}-view.tsx`:

```typescript
"use client";

interface {Feature}ViewProps {
  // All data props from page.tsx
  // Example:
  // engagements: Engagements;
  // highlights: Highlights;
  // trainingCards: TrainingCard[];
}

export function {Feature}View({
  // Destructure all props
}: {Feature}ViewProps) {
  // Move all UI composition from page.tsx here
  // Keep all client-side logic (hooks, state, effects)
  return (
    // UI structure from original page.tsx
  );
}
```

### Step 2: Refactor page.tsx

Update `app/{route}/page.tsx`:

```typescript
// Remove "use client" directive (make it a Server Component)
import { {Feature}View } from "./_components/{feature}-view";
// Import data fetching functions
// import { fetchEngagements, fetchHighlights, fetchTrainingCards } from "./_lib/...";

export default async function {Feature}Page() {
  // Fetch all data server-side
  // const engagements = await fetchEngagements();
  // const highlights = await fetchHighlights();
  // const trainingCards = await fetchTrainingCards();

  // For now, use mock data if real fetching isn't implemented
  // const engagements = mockEngagements;
  // const highlights = mockHighlights;
  // const trainingCards = mockTrainingCards;

  return (
    <{Feature}View
      // Pass all data as props
      // engagements={engagements}
      // highlights={highlights}
      // trainingCards={trainingCards}
    />
  );
}
```

### Step 3: Move UI Logic

- **Move from `page.tsx` to `{feature}-view.tsx`**:

  - All JSX/UI structure
  - All className/styling
  - All component imports
  - All client-side hooks (`useState`, `useEffect`, etc.)
  - All event handlers
  - All conditional rendering logic

- **Keep in `page.tsx`**:
  - Data fetching (async/await)
  - Server-side data transformation
  - Feature flags (if server-side)
  - Props passing to view

## Example: Before and After

### Before (Mixed Concerns)

```typescript
// app/studio/page.tsx
"use client";

import { HomeAnalytics } from "@/components/analytics/home/home-analytics";
import { HomeHighlights } from "@/components/analytics/home/home-highlights";
import { StudioGreeting } from "./_components/studio-greeting";
import { StudioTasks } from "./_components/studio-tasks";
import {
  mockEngagements,
  mockHighlights,
  mockTrainingCards,
} from "./_lib/mock-studio-data";

export default function StudioPage() {
  return (
    <div className='space-y-4 px-13 max-w-3xl mx-auto pt-20 pb-20'>
      <StudioGreeting />
      <div className='flex gap-2'>
        <div className='w-full flex flex-col gap-2'>
          <StudioTasks trainingCards={mockTrainingCards} />
          <HomeAnalytics engagements={mockEngagements} />
          <HomeHighlights highlights={mockHighlights} />
        </div>
      </div>
    </div>
  );
}
```

### After (Separated Concerns)

```typescript
// app/studio/page.tsx (Server Component)
import { StudioView } from "./_components/studio-view";
import {
  mockEngagements,
  mockHighlights,
  mockTrainingCards,
} from "./_lib/mock-studio-data";

export default async function StudioPage() {
  // In the future, replace with actual data fetching:
  // const engagements = await fetchEngagements();
  // const highlights = await fetchHighlights();
  // const trainingCards = await fetchTrainingCards();

  return (
    <StudioView
      engagements={mockEngagements}
      highlights={mockHighlights}
      trainingCards={mockTrainingCards}
    />
  );
}
```

```typescript
// app/studio/_components/studio-view.tsx (Client Component)
"use client";

import { HomeAnalytics } from "@/components/analytics/home/home-analytics";
import { HomeHighlights } from "@/components/analytics/home/home-highlights";
import { StudioGreeting } from "./studio-greeting";
import { StudioTasks } from "./studio-tasks";
import type { Engagements, Highlights, TrainingCard } from "../_lib/mock-studio-data";

interface StudioViewProps {
  engagements: Engagements;
  highlights: Highlights;
  trainingCards: TrainingCard[];
}

export function StudioView({
  engagements,
  highlights,
  trainingCards
}: StudioViewProps) {
  return (
    <div className='space-y-4 px-13 max-w-3xl mx-auto pt-20 pb-20'>
      <StudioGreeting />
      <div className='flex gap-2'>
        <div className='w-full flex flex-col gap-2'>
          <StudioTasks trainingCards={trainingCards} />
          <HomeAnalytics engagements={engagements} />
          <HomeHighlights highlights={highlights} />
        </div>
      </div>
    </div>
  );
}
```

## Key Principles

### 1. Separation of Concerns

- **Server (`page.tsx`)**: Data fetching only
- **Client (`{feature}-view.tsx`)**: UI composition only

### 2. Data Flow

- Data flows **down** from `page.tsx` → `{feature}-view.tsx` via props
- View receives all data as props
- View can use client-side hooks for additional data fetching if needed

### 3. Type Safety

- Define TypeScript interfaces for all props
- Export types from data files for reuse
- Use strict typing for all props

### 4. Server Component Benefits

- Leverage Next.js Server Components for faster initial load
- Reduce client bundle size
- Better SEO and performance

## Checklist

When refactoring a page:

- [ ] Created `{feature}-view.tsx` as a Client Component (`"use client"`)
- [ ] Removed `"use client"` from `page.tsx` (making it a Server Component)
- [ ] Moved all UI structure from `page.tsx` to `{feature}-view.tsx`
- [ ] Moved all component imports to `{feature}-view.tsx`
- [ ] Moved all styling/className logic to `{feature}-view.tsx`
- [ ] Added data fetching (or mock data) in `page.tsx`
- [ ] Defined TypeScript interface for view props
- [ ] Passed all data as props from `page.tsx` to view
- [ ] Verified no client-side hooks remain in `page.tsx`
- [ ] Verified page still renders correctly

## When to Use Page-View-Providers Pattern Instead

Use the **Page-View-Providers Pattern** (see `validation/page-view-providers-pattern.md`) when:

- Page needs React Context providers
- Page needs multiple nested providers
- Page has complex provider setup

The Page-View-Providers Pattern adds a third layer:

```
page.tsx → {feature}-providers.tsx → {feature}-view.tsx
```

## Anti-Patterns to Avoid

❌ **Don't mix data fetching and UI in page.tsx**:

```typescript
// WRONG
"use client";
export default function Page() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetchData().then(setData);
  }, []);
  return <div>{/* UI */}</div>;
}
```

✅ **Do separate data fetching and UI**:

```typescript
// CORRECT - page.tsx
export default async function Page() {
  const data = await fetchData();
  return <PageView data={data} />;
}

// CORRECT - page-view.tsx
"use client";
export function PageView({ data }) {
  return <div>{/* UI */}</div>;
}
```

❌ **Don't put client-side hooks in Server Component**:

```typescript
// WRONG
export default async function Page() {
  const [state, setState] = useState(); // ERROR: Can't use hooks in Server Component
  return <div>...</div>;
}
```

✅ **Do use hooks only in Client Components**:

```typescript
// CORRECT
"use client";
export function PageView() {
  const [state, setState] = useState(); // OK: Client Component
  return <div>...</div>;
}
```

## Reference Examples

### Simple Page (Current Pattern)

- **Page**: `app/studio/page.tsx` (after refactoring)
- **View**: `app/studio/_components/studio-view.tsx`

### Page with Providers (Different Pattern)

- See `validation/page-view-providers-pattern.md` for examples

## Usage

When you want to refactor a page to separate data fetching from UI:

1. Identify the page component that mixes data and UI
2. Create the view component following the pattern above
3. Move all UI logic to the view component
4. Refactor `page.tsx` to only handle data fetching
5. Pass data as props from page to view
6. Verify the refactoring works correctly
