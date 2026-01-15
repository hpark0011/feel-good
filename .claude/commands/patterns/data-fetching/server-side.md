---
name: Server-Side Data Fetching
category: Architecture
applies_to: [pages, loaders, services]
updated: 2026-01-14
documented_in: CLAUDE.md
parent: data-fetching.md
---

# Server-Side Data Fetching

Comprehensive patterns for server-side data fetching in Next.js 15 using loaders, streaming, and caching.

## Navigation

- **[← Back to Overview](./overview.md)**
- **[Client-Side Patterns →](./client-side.md)**
- **[Hybrid Patterns →](./hybrid.md)**

---

## When to Use

✅ Use server-side data fetching when:
- Data requires authentication (user-specific data)
- Data needs server persistence (Supabase)
- Cross-device synchronization is needed
- SEO/SSR is important
- Data should be fetched at page load

---

## File Organization

```
app/(protected)/dashboard/{feature}/
  page.tsx                    # Server component (async)
  _view/
    {feature}-view.tsx        # Client component (receives data via props)
  _lib/server/
    {feature}.loader.ts       # Server data fetching functions

app/_actions/
  {feature}-actions.ts        # Server actions (mutations)

lib/services/
  {feature}.service.ts        # Business logic (Supabase operations)
```

---

## Loader Pattern

**Location:** `app/(protected)/dashboard/{feature}/_lib/server/{feature}.loader.ts`

**Structure:**
```typescript
import { getCurrentServerUser } from "@/utils/supabase/get-current-server-user";
import { getSupabaseServerClient } from "@/utils/supabase/client/supabase-server";
import { FeatureService } from "@/lib/services/feature.service";

/**
 * Loads feature data for the authenticated user.
 * Called from page.tsx (Server Component).
 *
 * @returns Feature data for the current user
 */
export async function loadFeatureData() {
  // Get authenticated user
  const user = await getCurrentServerUser();

  // Create Supabase client
  const supabase = await getSupabaseServerClient();

  // Use service layer for business logic
  const service = new FeatureService(supabase);

  // Fetch and return data
  return service.getUserData(user.id);
}

/**
 * Loads paginated feature data with filters.
 *
 * @param filters - Optional filters for data
 * @param page - Page number (1-based)
 * @param pageSize - Number of items per page
 * @returns Paginated data with metadata
 */
export async function loadPaginatedData(
  filters?: FeatureFilters,
  page: number = 1,
  pageSize: number = 20
) {
  const user = await getCurrentServerUser();
  const supabase = await getSupabaseServerClient();
  const service = new FeatureService(supabase);

  return service.getPaginatedData(user.id, {
    filters,
    page,
    pageSize,
  });
}
```

---

## Usage in page.tsx (Server Component)

**Location:** `app/(protected)/dashboard/{feature}/page.tsx`

```typescript
import { FeatureView } from "./_view/feature-view";
import { loadFeatureData } from "./_lib/server/feature.loader";

export default async function FeaturePage() {
  // Fetch data server-side
  const data = await loadFeatureData();

  // Pass data to view via props
  return <FeatureView data={data} />;
}
```

---

## Usage in {feature}-view.tsx (Client Component)

**Location:** `app/(protected)/dashboard/{feature}/_view/feature-view.tsx`

```typescript
"use client";

import { useState, useTransition } from "react";
import { updateFeatureAction, deleteFeatureAction } from "@/app/_actions/feature-actions";
import type { FeatureData } from "@/lib/services/feature.service";

interface FeatureViewProps {
  data: FeatureData;
}

export function FeatureView({ data }: FeatureViewProps) {
  const [items, setItems] = useState(data);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (id: string, updates: Partial<FeatureData>) => {
    // Optimistic update
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));

    // Server mutation
    startTransition(async () => {
      const result = await updateFeatureAction({ id, ...updates });

      if (!result.success) {
        // Revert on error
        setItems(data);
        toast.error(result.message);
      }
    });
  };

  return (
    <div>
      {items.map(item => (
        <ItemCard
          key={item.id}
          item={item}
          onUpdate={handleUpdate}
        />
      ))}
    </div>
  );
}
```

---

## Streaming & Suspense Patterns

Next.js supports progressive rendering through streaming and Suspense boundaries. This allows you to show UI immediately while data loads in the background.

### Route-Level Streaming (loading.tsx)

Create a `loading.tsx` file next to your `page.tsx` to show a loading state while the entire route loads:

```typescript
// app/(protected)/dashboard/files/loading.tsx
export default function Loading() {
  return <FilesSkeleton />
}
```

Next.js automatically wraps your `page.tsx` in a Suspense boundary when `loading.tsx` exists.

### Component-Level Streaming (Granular Suspense)

For better performance, wrap independent async components in their own Suspense boundaries so they can load concurrently:

```typescript
// app/(protected)/dashboard/artist/[id]/page.tsx
import { Suspense } from 'react'

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const artist = await getArtist(id) // Loads first (critical data)

  return (
    <div>
      <h1>{artist.name}</h1>

      {/* Each section streams independently */}
      <Suspense fallback={<PlaylistsSkeleton />}>
        <Playlists artistId={artist.id} />
      </Suspense>

      <Suspense fallback={<AlbumsSkeleton />}>
        <Albums artistId={artist.id} />
      </Suspense>

      <Suspense fallback={<ConcertsSkeleton />}>
        <Concerts artistId={artist.id} />
      </Suspense>
    </div>
  )
}

// Each component fetches its own data
async function Playlists({ artistId }: { artistId: string }) {
  const playlists = await getArtistPlaylists(artistId)
  return <PlaylistsGrid playlists={playlists} />
}

async function Albums({ artistId }: { artistId: string }) {
  const albums = await getArtistAlbums(artistId)
  return <AlbumsGrid albums={albums} />
}

async function Concerts({ artistId }: { artistId: string }) {
  const concerts = await getArtistConcerts(artistId)
  return <ConcertsList concerts={concerts} />
}
```

**Benefits:**
- Critical data (artist name) loads first
- Independent sections stream in as they're ready
- Faster perceived performance
- Better user experience (no "all or nothing" loading)

### Parallel vs Sequential Data Fetching

**Parallel (Recommended for independent data):**

```typescript
// GOOD: Both requests start simultaneously
export default async function Page() {
  const artistPromise = getArtist()
  const albumsPromise = getAlbums()

  // Wait for both in parallel
  const [artist, albums] = await Promise.all([artistPromise, albumsPromise])
  // Total time = max(artist, albums)

  return <div>{/* render */}</div>
}
```

**Sequential (Use only for dependent data):**

```typescript
// GOOD: albums depends on artist.id
export default async function Page() {
  const artist = await getArtist()
  const albums = await getAlbums(artist.id) // Needs artist first
  // Total time = artist + albums

  return <div>{/* render */}</div>
}
```

**⚠️ Anti-Pattern (Sequential without dependency):**

```typescript
// BAD: Creates unnecessary waterfall
const user = await getUser()    // Waits
const posts = await getPosts()  // Waits for user (unnecessary!)
const tags = await getTags()    // Waits for posts (unnecessary!)
// Total time = user + posts + tags (SLOW!)

// Should be:
const [user, posts, tags] = await Promise.all([
  getUser(),
  getPosts(),
  getTags()
])
// Total time = max(user, posts, tags) (FAST!)
```

---

## Caching Strategies (Next.js 15)

Next.js 15 changed the default caching behavior. You must **explicitly** choose your caching strategy.

### Option 1: 'use cache' Directive (Recommended)

The newest and cleanest approach:

```typescript
// lib/data/categories.ts
export async function getCategories() {
  'use cache' // Caches the entire function result
  const res = await fetch('https://api.example.com/categories')
  return res.json()
}
```

### Option 2: Fetch with Cache Options

```typescript
// Force cache (cache indefinitely)
const data = await fetch('https://api.example.com/data', {
  cache: 'force-cache'
})

// No caching (always fresh) - DEFAULT in Next.js 15
const data = await fetch('https://api.example.com/data', {
  cache: 'no-store'
})

// Time-based revalidation (ISR)
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 3600 } // Revalidate every hour
})

// Tag-based revalidation
const data = await fetch('https://api.example.com/data', {
  next: { tags: ['products'] }
})
```

### Option 3: unstable_cache for Database Queries

For direct database queries (not using fetch), use `unstable_cache`:

```typescript
import { unstable_cache } from 'next/cache'
import { db } from '@/lib/db'

export const getPosts = unstable_cache(
  async () => {
    return await db.select().from(posts)
  },
  ['posts'], // Cache key
  {
    tags: ['posts'],
    revalidate: 3600 // 1 hour
  }
)
```

### On-Demand Revalidation

Use in Server Actions to invalidate caches after mutations:

```typescript
'use server'

import { revalidatePath, revalidateTag } from 'next/cache'

export async function updateProduct(formData: FormData) {
  // Update database
  await db.products.update(/* ... */)

  // Revalidate specific path
  revalidatePath('/products')

  // OR revalidate by tag
  revalidateTag('products')

  return { success: true }
}
```

### Automatic Request Deduplication

**Important:** Next.js automatically deduplicates identical `fetch` requests within a single render pass. You don't need manual memoization or context providers.

```typescript
// These three components make the same fetch call
async function ComponentA() {
  const data = await fetch('https://api.example.com/data')
  return <div>{data.title}</div>
}

async function ComponentB() {
  const data = await fetch('https://api.example.com/data') // Deduplicated!
  return <div>{data.description}</div>
}

async function ComponentC() {
  const data = await fetch('https://api.example.com/data') // Deduplicated!
  return <div>{data.author}</div>
}

// Result: Only ONE network request, all three components get the same data
```

**This means:**
- No need to fetch at the top level and prop drill
- Each component can fetch what it needs
- Next.js handles deduplication automatically
- Cleaner, more maintainable code

---

## Error Handling Patterns

### error.tsx (Segment-Level Error Boundary)

Create an `error.tsx` file next to your route segment to handle errors:

```typescript
// app/(protected)/dashboard/files/error.tsx
'use client' // Error components must be Client Components

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="error-container">
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

**How it works:**
- Catches errors in page.tsx and nested components
- Provides a way to recover (reset function)
- Scoped to the route segment

### Inline Error Handling

For expected errors during data fetching:

```typescript
export default async function Page() {
  const res = await fetch('https://api.example.com/data')

  if (!res.ok) {
    return (
      <div className="error">
        <p>Failed to load data</p>
        <p>Status: {res.status}</p>
      </div>
    )
  }

  const data = await res.json()
  return <DataDisplay data={data} />
}
```

### Combining Suspense + Error Boundaries

**Best Practice:** Always wrap streamed components in error boundaries:

```typescript
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

export default function Page() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<Loading />}>
        <AsyncDataComponent />
      </Suspense>
    </ErrorBoundary>
  )
}
```

**Why both?**
- Suspense handles loading states
- Error boundaries handle failures
- Provides complete UX coverage

---

## Performance Best Practices

### 1. Avoid Request Waterfalls

```typescript
// BAD: Sequential (slow)
const user = await getUser()
const posts = await getPosts()
const comments = await getComments()
// Total: user + posts + comments

// GOOD: Parallel (fast)
const [user, posts, comments] = await Promise.all([
  getUser(),
  getPosts(),
  getComments()
])
// Total: max(user, posts, comments)
```

### 2. Leverage Automatic Deduplication

```typescript
// Don't do this (manual memoization)
const dataCache = new Map()

function getData() {
  if (dataCache.has('key')) return dataCache.get('key')
  const data = fetch(...)
  dataCache.set('key', data)
  return data
}

// Next.js does this automatically!
// Just fetch directly in components
```

### 3. Select Only Required Fields

```typescript
// BAD: Fetching entire objects
const users = await db.users.findMany()

// GOOD: Select only what you need
const users = await db.users.findMany({
  select: {
    id: true,
    name: true,
    email: true
    // Don't include large fields if not needed
  }
})
```

### 4. Paginate Early

```typescript
// For lists, always paginate
export async function loadPaginatedData(
  page: number = 1,
  pageSize: number = 20
) {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from('items')
    .select('*')
    .range((page - 1) * pageSize, page * pageSize - 1)

  return data
}
```

### 5. Log Slow Queries

```typescript
// Add timing to loaders
export async function loadFeatureData() {
  const start = Date.now()

  const data = await fetchData()

  const duration = Date.now() - start
  if (duration > 100) {
    console.warn(`Slow query: loadFeatureData took ${duration}ms`)
  }

  return data
}
```

### 6. Cache Expensive Computations

```typescript
import { cache } from 'react'

// Memoize expensive operations
export const getProcessedData = cache(async () => {
  const data = await getRawData()
  return expensiveTransformation(data)
})
```

---

## Data Flow: Server-Side

```
┌─────────────────────────────────────────────────────────┐
│ page.tsx (Server Component)                             │
│ - async function                                        │
│ - Calls loader                                          │
└────────────────┬────────────────────────────────────────┘
                 │ await loadFeatureData()
                 ↓
┌─────────────────────────────────────────────────────────┐
│ feature.loader.ts                                       │
│ - Get current user                                      │
│ - Create Supabase client                                │
│ - Call service layer                                    │
└────────────────┬────────────────────────────────────────┘
                 │ service.getUserData()
                 ↓
┌─────────────────────────────────────────────────────────┐
│ feature.service.ts                                      │
│ - Business logic                                        │
│ - Supabase queries                                      │
│ - Data transformation                                   │
└────────────────┬────────────────────────────────────────┘
                 │ Supabase query
                 ↓
┌─────────────────────────────────────────────────────────┐
│ Supabase Database                                       │
└────────────────┬────────────────────────────────────────┘
                 │ Returns data
                 ↓
┌─────────────────────────────────────────────────────────┐
│ page.tsx passes data as props                           │
└────────────────┬────────────────────────────────────────┘
                 │ <FeatureView data={data} />
                 ↓
┌─────────────────────────────────────────────────────────┐
│ feature-view.tsx (Client Component)                     │
│ - Receives data via props                               │
│ - Manages UI state                                      │
│ - Calls server actions for mutations                    │
└─────────────────────────────────────────────────────────┘
                 │ User interaction
                 ↓
┌─────────────────────────────────────────────────────────┐
│ feature-actions.ts (Server Actions)                     │
│ - Mutations (POST/PUT/DELETE)                           │
│ - See ../server-actions.md                              │
└─────────────────────────────────────────────────────────┘
```

---

## See Also

- **[Overview](./overview.md)** - Quick start and decision tree
- **[Client-Side Patterns](./client-side.md)** - localStorage approach
- **[Hybrid Patterns](./hybrid.md)** - Server + client combined
- **[Performance](./performance.md)** - Detailed performance guidance
- **[Examples](./examples.md)** - Real-world examples and checklists
