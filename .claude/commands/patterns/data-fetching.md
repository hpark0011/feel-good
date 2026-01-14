---
name: Data Fetching Pattern
category: Architecture
applies_to: [pages, hooks, loaders, services]
updated: 2026-01-14
documented_in: CLAUDE.md
---

# Data Fetching Pattern

This document defines comprehensive patterns for data fetching in the Greyboard codebase. It covers server-side loaders, client-side localStorage hooks, and when to use each approach.

## ⚠️ Next.js 15 Breaking Change

**Critical:** Default caching behavior has changed in Next.js 15.

```typescript
// Next.js 13-14 (old behavior)
fetch(url) // Cached by default

// Next.js 15 (new behavior)
fetch(url) // NOT cached (equivalent to { cache: 'no-store' })
```

**You must explicitly opt-in to caching:**

```typescript
// Option 1: 'use cache' directive (recommended)
export async function getData() {
  'use cache'
  const res = await fetch('https://api.example.com/data')
  return res.json()
}

// Option 2: fetch with cache option
fetch(url, { cache: 'force-cache' }) // Cache indefinitely

// Option 3: Time-based revalidation
fetch(url, { next: { revalidate: 3600 } }) // Revalidate every hour

// Option 4: Tag-based revalidation
fetch(url, { next: { tags: ['products'] } })
```

**Why this matters:**
- Your data fetching code may need updates if migrating from Next.js 13-14
- Always explicitly choose your caching strategy
- See [Caching Strategies](#caching-strategies-nextjs-15) section below for details

---

## Table of Contents

- [⚠️ Next.js 15 Breaking Change](#️-nextjs-15-breaking-change)
- [Quick Start](#quick-start)
- [Overview](#overview)
- [Approach 1: Server-Side Data Fetching](#approach-1-server-side-data-fetching)
  - [Loader Pattern](#loader-pattern)
  - [Streaming & Suspense](#streaming--suspense-patterns)
  - [Caching Strategies](#caching-strategies-nextjs-15)
  - [Error Handling](#error-handling-patterns)
  - [Performance](#performance-best-practices)
- [Approach 2: Client-Side (localStorage)](#approach-2-client-side-data-fetching-localstorage)
- [Approach 3: Hybrid](#approach-3-hybrid-server--client)
- [Server Actions vs Route Handlers](#server-actions-vs-route-handlers)
- [Performance & Observability](#performance--observability)
- [Reference](#reference)
  - [Naming Conventions](#naming-conventions)
  - [When to Use Which](#when-to-use-which-approach)
  - [Examples from Codebase](#examples-from-codebase)
  - [Anti-Patterns](#anti-patterns)
  - [Checklists](#checklist)

---

## Quick Start

### Core Principles

1. **Server-First**: Fetch data in Server Components by default
2. **Explicit Caching**: Always specify cache behavior in Next.js 15
3. **Colocation**: Fetch data where it's used (no prop drilling)
4. **Parallel Fetching**: Use `Promise.all` for independent data
5. **Streaming**: Use Suspense for progressive rendering
6. **Serializable Data**: Only pass JSON-serializable data to Client Components
7. **Server Actions**: Use for internal mutations, Route Handlers for external APIs

### Quick Decision Tree

```
Need to fetch data?
│
├─ Server persistence required? (Supabase)
│  └─ YES → Use Server-Side approach (Loader Pattern)
│           ├─ page.tsx → loader.ts → service.ts → Supabase
│           └─ Pass data as props to view component
│
└─ NO → Client-only state?
    └─ YES → Use Client-Side approach (localStorage)
             ├─ Component → useFeatureData hook → useLocalStorage
             └─ All CRUD in hook, component only renders
```

### Common Patterns

```typescript
// Server Component: Fetch data
export default async function Page() {
  // Parallel fetching for independent data
  const [user, posts] = await Promise.all([
    getUser(),    // Automatically deduped
    getPosts()    // if called elsewhere
  ])

  // Pass to Client Component
  return <View user={user} posts={posts} />
}

// Client Component: Receive data
'use client'
export function View({ user, posts }) {
  // Handle interactivity, call Server Actions for mutations
  return <div>{/* UI */}</div>
}
```

---

## Overview

The application uses **two complementary data fetching approaches**:

1. **Server-Side Data Fetching** - For authenticated data requiring Supabase persistence
2. **Client-Side Data Fetching** - For localStorage-based client-only features

Each approach has specific file organization, naming conventions, and use cases.

---

## Approach 1: Server-Side Data Fetching

### When to Use

✅ Use server-side data fetching when:
- Data requires authentication (user-specific data)
- Data needs server persistence (Supabase)
- Cross-device synchronization is needed
- SEO/SSR is important
- Data should be fetched at page load

### File Organization

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

### Loader Pattern

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

### Usage in page.tsx (Server Component)

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

### Usage in {feature}-view.tsx (Client Component)

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

### Streaming & Suspense Patterns

Next.js supports progressive rendering through streaming and Suspense boundaries. This allows you to show UI immediately while data loads in the background.

#### Route-Level Streaming (loading.tsx)

Create a `loading.tsx` file next to your `page.tsx` to show a loading state while the entire route loads:

```typescript
// app/(protected)/dashboard/files/loading.tsx
export default function Loading() {
  return <FilesSkeleton />
}
```

Next.js automatically wraps your `page.tsx` in a Suspense boundary when `loading.tsx` exists.

#### Component-Level Streaming (Granular Suspense)

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

#### Parallel vs Sequential Data Fetching

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

### Caching Strategies (Next.js 15)

Next.js 15 changed the default caching behavior. You must **explicitly** choose your caching strategy.

#### Option 1: 'use cache' Directive (Recommended)

The newest and cleanest approach:

```typescript
// lib/data/categories.ts
export async function getCategories() {
  'use cache' // Caches the entire function result
  const res = await fetch('https://api.example.com/categories')
  return res.json()
}
```

#### Option 2: Fetch with Cache Options

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

#### Option 3: unstable_cache for Database Queries

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

#### On-Demand Revalidation

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

#### Automatic Request Deduplication

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

### Error Handling Patterns

#### error.tsx (Segment-Level Error Boundary)

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

#### Inline Error Handling

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

#### Combining Suspense + Error Boundaries

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

### Performance Best Practices

#### 1. Avoid Request Waterfalls

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

#### 2. Leverage Automatic Deduplication

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

#### 3. Select Only Required Fields

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

#### 4. Paginate Early

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

#### 5. Log Slow Queries

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

#### 6. Cache Expensive Computations

```typescript
import { cache } from 'react'

// Memoize expensive operations
export const getProcessedData = cache(async () => {
  const data = await getRawData()
  return expensiveTransformation(data)
})
```

---

### Data Flow: Server-Side

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
│ - See server-actions.md                                 │
└─────────────────────────────────────────────────────────┘
```

---

## Approach 2: Client-Side Data Fetching (localStorage)

### When to Use

✅ Use client-side localStorage when:
- Data is client-only (no server persistence needed)
- Offline-first functionality is required
- Rapid iteration without backend changes
- Data doesn't require authentication
- Cross-device sync is NOT needed

### File Organization

```
app/(protected)/dashboard/{feature}/
  page.tsx                    # Minimal entry point
  _view/
    {feature}-view.tsx        # Orchestrates hooks and components
  _components/
    feature-component.tsx     # UI components
  _lib/
    {feature}.hooks.ts        # Data management hooks
    {feature}.utils.ts        # Serialization/utilities

lib/
  storage-keys.ts             # Centralized storage key constants
  storage.ts                  # Storage utilities
```

### Hook Pattern

**Location:** `app/(protected)/dashboard/{feature}/_lib/{feature}.hooks.ts`

**Structure:**
```typescript
import { useCallback, useMemo } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { serializeData, deserializeData } from "./{feature}.utils";
import type { FeatureData, FeatureItem } from "@/types/feature.types";

/**
 * Manages feature data with localStorage persistence.
 * Encapsulates all CRUD operations and business logic.
 *
 * @param options - Configuration options
 * @param options.filter - Optional filters to apply
 * @returns Feature data and operation methods
 *
 * @example
 * const { data, addItem, updateItem } = useFeatureData({ filter: selectedIds });
 */
export function useFeatureData(options?: { filter?: string[] }) {
  // Raw localStorage state
  const [rawData, setRawData] = useLocalStorage<string>(
    STORAGE_KEYS.FEATURE.DATA,
    serializeData(getInitialData())
  );

  // Deserialize data
  const data = useMemo(() => {
    return deserializeData(rawData);
  }, [rawData]);

  // Apply filters if provided
  const filteredData = useMemo(() => {
    if (!options?.filter?.length) return data;

    return data.filter(item =>
      options.filter.includes(item.categoryId)
    );
  }, [data, options?.filter]);

  // CRUD Operations

  const addItem = useCallback((newItem: Omit<FeatureItem, "id" | "createdAt">) => {
    setRawData(prev => {
      const currentData = deserializeData(prev);
      const item: FeatureItem = {
        ...newItem,
        id: `item-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      return serializeData([...currentData, item]);
    });
  }, [setRawData]);

  const updateItem = useCallback((itemId: string, updates: Partial<FeatureItem>) => {
    setRawData(prev => {
      const currentData = deserializeData(prev);
      const updatedData = currentData.map(item =>
        item.id === itemId
          ? { ...item, ...updates, updatedAt: new Date() }
          : item
      );

      return serializeData(updatedData);
    });
  }, [setRawData]);

  const deleteItem = useCallback((itemId: string) => {
    setRawData(prev => {
      const currentData = deserializeData(prev);
      const filtered = currentData.filter(item => item.id !== itemId);

      return serializeData(filtered);
    });
  }, [setRawData]);

  const clearAll = useCallback(() => {
    setRawData(serializeData(getInitialData()));
  }, [setRawData]);

  // Bulk operations

  const addItems = useCallback((items: Omit<FeatureItem, "id" | "createdAt">[]) => {
    setRawData(prev => {
      const currentData = deserializeData(prev);
      const now = new Date();

      const newItems = items.map((item, index) => ({
        ...item,
        id: `item-${Date.now()}-${index}`,
        createdAt: now,
        updatedAt: now,
      }));

      return serializeData([...currentData, ...newItems]);
    });
  }, [setRawData]);

  // Utility methods

  const findItem = useCallback((itemId: string) => {
    return data.find(item => item.id === itemId) || null;
  }, [data]);

  // Export/Import

  const exportData = useCallback(() => {
    return JSON.stringify(data, null, 2);
  }, [data]);

  const importData = useCallback((jsonData: string) => {
    try {
      const imported = JSON.parse(jsonData);
      setRawData(serializeData(imported));
    } catch (error) {
      console.error("Failed to import data:", error);
      throw new Error("Invalid data format");
    }
  }, [setRawData]);

  return {
    // State
    data: filteredData,
    rawData: data, // Unfiltered

    // CRUD
    addItem,
    updateItem,
    deleteItem,
    clearAll,

    // Bulk
    addItems,

    // Utilities
    findItem,
    exportData,
    importData,
  };
}

// Initial data factory
function getInitialData(): FeatureData {
  return {
    items: [],
    metadata: {
      version: "1.0",
      lastModified: new Date(),
    },
  };
}
```

### Usage in Component

**Location:** `components/{feature}/{feature}.tsx`

```typescript
"use client";

import { useFeatureData } from "@/app/(protected)/dashboard/{feature}/_lib/{feature}.hooks";
import { useFilterState } from "@/hooks/use-filter-state";

export function Feature() {
  const { selectedCategories } = useFilterState();

  // Data layer - delegate all operations to hook
  const {
    data,
    addItem,
    updateItem,
    deleteItem,
    exportData,
  } = useFeatureData({ filter: selectedCategories });

  // UI event handlers - delegate to hook methods
  const handleAdd = () => {
    addItem({
      title: "New Item",
      description: "",
      categoryId: selectedCategories[0],
    });
  };

  const handleUpdate = (id: string, title: string) => {
    updateItem(id, { title });
  };

  const handleDelete = (id: string) => {
    deleteItem(id);
  };

  const handleExport = () => {
    const json = exportData();
    downloadFile(json, "export.json");
  };

  // UI rendering only - no business logic
  return (
    <div>
      <button onClick={handleAdd}>Add Item</button>
      <button onClick={handleExport}>Export</button>

      {data.map(item => (
        <ItemCard
          key={item.id}
          item={item}
          onUpdate={(title) => handleUpdate(item.id, title)}
          onDelete={() => handleDelete(item.id)}
        />
      ))}
    </div>
  );
}
```

### Data Flow: Client-Side (localStorage)

```
┌─────────────────────────────────────────────────────────┐
│ component.tsx                                           │
│ - Calls useFeatureData hook                             │
│ - Delegates all operations to hook                      │
└────────────────┬────────────────────────────────────────┘
                 │ useFeatureData({ filter })
                 ↓
┌─────────────────────────────────────────────────────────┐
│ feature.hooks.ts                                        │
│ - useLocalStorage for persistence                       │
│ - Deserialize data                                      │
│ - Apply filters                                         │
│ - CRUD operations (addItem, updateItem, etc.)           │
│ - Export/Import methods                                 │
└────────────────┬────────────────────────────────────────┘
                 │ useLocalStorage(STORAGE_KEY, initial)
                 ↓
┌─────────────────────────────────────────────────────────┐
│ use-local-storage.ts (shared hook)                      │
│ - SSR-safe localStorage access                          │
│ - Cross-tab synchronization                             │
│ - Triggers storage events                               │
└────────────────┬────────────────────────────────────────┘
                 │ localStorage.setItem/getItem
                 ↓
┌─────────────────────────────────────────────────────────┐
│ Browser localStorage                                    │
│ - Key: STORAGE_KEYS.FEATURE.DATA                        │
│ - Value: Serialized JSON string                         │
└────────────────┬────────────────────────────────────────┘
                 │ Returns serialized data
                 ↓
┌─────────────────────────────────────────────────────────┐
│ feature.utils.ts                                        │
│ - deserializeData() → Parse JSON + type safety          │
│ - serializeData() → Stringify with validation           │
└────────────────┬────────────────────────────────────────┘
                 │ Returns typed data
                 ↓
┌─────────────────────────────────────────────────────────┐
│ useFeatureData returns                                  │
│ { data, addItem, updateItem, deleteItem, ... }          │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│ component.tsx                                           │
│ - Renders UI based on data                              │
│ - Calls hook methods on user interaction                │
└─────────────────────────────────────────────────────────┘
```

---

## Approach 3: Hybrid (Server + Client)

### When to Use

✅ Use hybrid approach when:
- Initial data should be server-rendered
- Client-side updates need optimistic UI
- Real-time features with server synchronization
- Progressive enhancement pattern

### Pattern

**page.tsx (Server Component):**
```typescript
import { FeatureView } from "./_view/feature-view";
import { loadInitialData } from "./_lib/server/feature.loader";

export default async function FeaturePage() {
  // Server-side initial load
  const initialData = await loadInitialData();

  return <FeatureView initialData={initialData} />;
}
```

**feature-view.tsx (Client Component):**
```typescript
"use client";

import { useState, useTransition } from "react";
import { updateAction } from "@/app/_actions/feature-actions";

export function FeatureView({ initialData }) {
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = async (id: string, updates: any) => {
    // Optimistic update
    setData(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));

    // Server mutation
    startTransition(async () => {
      const result = await updateAction({ id, updates });

      if (!result.success) {
        setData(initialData); // Revert
      } else {
        setData(result.data); // Use server data
      }
    });
  };

  return <div>{/* UI */}</div>;
}
```

---

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Loader | `{feature}.loader.ts` | `files.loader.ts` |
| Hook | `use-{feature}-data.ts` | `use-board-data.ts` |
| Service | `{feature}.service.ts` | `file.service.ts` |
| Actions | `{feature}-actions.ts` | `file-actions.ts` |
| Utils | `{feature}.utils.ts` | `board.utils.ts` |
| Storage Key | `{APP}.v{N}.{category}.{key}` | `docgen.v1.tasks.board-state` |

---

## When to Use Which Approach

| Requirement | Server-Side | Client-Side (localStorage) | Hybrid |
|-------------|-------------|----------------------------|--------|
| Server persistence | ✅ Required | ❌ No | ✅ Yes |
| Authentication required | ✅ Yes | ⚠️ Optional (UI only) | ✅ Yes |
| Cross-device sync | ✅ Yes | ❌ No | ✅ Yes |
| Offline-first | ❌ No | ✅ Yes | ⚠️ Partial |
| Rapid iteration | ⚠️ Moderate | ✅ Fast | ⚠️ Moderate |
| SEO/SSR important | ✅ Yes | ❌ No | ✅ Yes |
| Simple client state | ❌ Overkill | ✅ Perfect | ❌ Overkill |
| Real-time updates | ⚠️ Polling | ❌ No | ✅ Yes |
| Optimistic UI | ⚠️ Complex | ✅ Easy | ✅ Built-in |

---

## Server Actions vs Route Handlers

A common question: "When should I use Server Actions vs Route Handlers (API routes)?"

### Quick Decision

**Use Server Actions when:**
- ✅ Internal app operations (forms, mutations within your Next.js app)
- ✅ Direct component integration (called from Client Components)
- ✅ Type-safe function calls (TypeScript end-to-end)
- ✅ Simple data mutations (create, update, delete)
- ✅ Automatic POST handling

**Use Route Handlers when:**
- ✅ External API access (webhooks, third-party integrations)
- ✅ Public endpoints (need explicit URL)
- ✅ Non-Next.js clients (mobile apps, external services)
- ✅ Need explicit HTTP control (GET, POST, PUT, DELETE, custom headers)
- ✅ Multiple HTTP methods on same endpoint

### Rule of Thumb

```
Internal operations → Server Actions
External access → Route Handlers
```

### Examples

**Server Action (Internal Mutation):**

```typescript
// app/_actions/product-actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string
  const price = parseFloat(formData.get('price') as string)

  const product = await db.products.create({ name, price })

  revalidatePath('/products')

  return { success: true, product }
}

// In component
import { createProduct } from '@/app/_actions/product-actions'

export default function ProductForm() {
  return (
    <form action={createProduct}>
      <input name="name" required />
      <input name="price" type="number" required />
      <button type="submit">Create</button>
    </form>
  )
}
```

**Route Handler (External API):**

```typescript
// app/api/products/route.ts
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET handler
export async function GET(request: Request) {
  const products = await db.products.findMany()
  return NextResponse.json(products)
}

// POST handler
export async function POST(request: Request) {
  const body = await request.json()
  const product = await db.products.create(body)
  return NextResponse.json(product, { status: 201 })
}
```

### Integration Pattern

**Pattern:**
- **Loaders** → Initial data fetching (page load)
- **Server Actions** → Data mutations (user actions)
- **Route Handlers** → External API access
- **View** → Optimistic updates + action calls

**See:** `server-actions.md` for detailed mutation patterns.

**Example Integration:**
```typescript
// Loader fetches initial data
const initialFiles = await loadFiles();

// View manages state + calls actions for mutations
<FilesView
  initialFiles={initialFiles}
  onUpload={uploadFileAction}  // Server action
  onDelete={deleteFileAction}  // Server action
/>
```

---

## Performance & Observability

Beyond individual data fetching patterns, consider these system-wide practices:

### 1. Request Deduplication (Automatic)

Next.js automatically deduplicates identical fetch requests within a single render pass. **You don't need to do anything** - just fetch where you need data.

```typescript
// All three components fetch the same data
// Result: Only ONE network request
<UserProfile />  {/* fetch('/api/user') */}
<UserSettings /> {/* fetch('/api/user') - deduplicated */}
<UserStats />    {/* fetch('/api/user') - deduplicated */}
```

### 2. Monitoring Slow Queries

Add timing instrumentation to loaders:

```typescript
export async function loadFeatureData() {
  const start = Date.now()
  const data = await fetchData()
  const duration = Date.now() - start

  if (duration > 100) {
    console.warn(`[Performance] loadFeatureData took ${duration}ms`)
  }

  return data
}
```

### 3. Pagination Strategy

Always paginate lists early. Prefer cursor-based pagination for scalability:

```typescript
export async function loadPaginatedItems(
  cursor?: string,
  limit: number = 20
) {
  const supabase = await getSupabaseServerClient()

  let query = supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (cursor) {
    query = query.lt('created_at', cursor)
  }

  const { data } = await query

  return {
    items: data,
    nextCursor: data[data.length - 1]?.created_at
  }
}
```

### 4. Field Selection

Only select the fields you need:

```typescript
// BAD: Fetching everything
const users = await db.users.findMany()

// GOOD: Select only required fields
const users = await db.users.findMany({
  select: {
    id: true,
    name: true,
    email: true
    // Exclude large fields (bio, avatar_url, etc.)
  }
})
```

### 5. Cache Expensive Operations

Use React's `cache` for expensive transformations:

```typescript
import { cache } from 'react'

export const getProcessedData = cache(async () => {
  const raw = await getRawData()
  return expensiveTransformation(raw) // Only runs once per request
})
```

### 6. Observability Checklist

- [ ] Log slow queries (>100ms threshold)
- [ ] Monitor cache hit rates
- [ ] Track data fetching errors
- [ ] Measure page load times
- [ ] Alert on performance regressions
- [ ] Profile production queries periodically

---

## Reference

This section provides practical examples, anti-patterns, and checklists for implementing data fetching patterns.

### Examples from Codebase

### Example 1: Tasks Module (localStorage)

**Pattern:** Client-side only, no server persistence

**Files:**
- Hook: `app/(protected)/dashboard/tasks/_lib/board.hooks.ts`
- Component: `components/tasks/board.tsx`
- Utils: `lib/board-storage.ts` (serialization)
- Storage Key: `docgen.v1.tasks.board-state`

**Data Flow:**
```
board.tsx
  ↓ uses
useBoardData hook
  ↓ calls
useLocalStorage (SSR-safe)
  ↓ persists to
localStorage["docgen.v1.tasks.board-state"]
```

**Why localStorage?**
- Tasks are user-specific UI state
- No need for cross-device sync
- Offline-first requirement
- Rapid iteration on features

---

### Example 2: Files Module (Server-side)

**Pattern:** Server rendering + client mutations

**Files:**
- Loader: `app/(protected)/dashboard/files/_lib/server/files.loader.ts`
- Service: `lib/services/file.service.ts`
- Actions: `app/_actions/file-actions.ts`
- View: `app/(protected)/dashboard/files/_view/files-view.tsx`

**Data Flow:**
```
page.tsx (server)
  ↓ calls
files.loader.ts
  ↓ uses
FileService → Supabase
  ↓ returns data
page.tsx passes to
  ↓
files-view.tsx (client)
  ↓ user uploads
uploadFileAction (server action)
  ↓ updates
Supabase Storage + Database
```

**Why server-side?**
- Files require authentication
- Storage needs to persist server-side
- Cross-device access required
- File URLs generated server-side

---

## Anti-Patterns

### ❌ DON'T: Fetch Data in Providers Wrapper

```typescript
// WRONG - providers should only provide context
export function FeatureProviders({ children }) {
  const { data } = useTRPC.feature.getData(); // BAD!
  return <Provider value={data}>{children}</Provider>;
}
```

✅ **DO: Fetch in page.tsx or view:**
```typescript
// CORRECT - fetch in page.tsx
export default async function Page() {
  const data = await loadData();
  return <FeatureView data={data} />;
}
```

### ❌ DON'T: Mix Server and localStorage for Same Data

```typescript
// WRONG - inconsistent data sources
const serverData = await loadFiles(); // Server
const localData = useLocalFiles(); // localStorage
// Which is the source of truth?
```

✅ **DO: Choose one approach:**
```typescript
// CORRECT - single source of truth
const files = await loadFiles(); // OR
const { files } = useFilesData(); // NOT both
```

### ❌ DON'T: Put Loaders in Wrong Directory

```typescript
// WRONG location
app/(protected)/dashboard/files/loader.ts // Missing _lib/server/

// WRONG - not a loader
app/_actions/file-loader.ts // Loaders ≠ Actions
```

✅ **DO: Follow conventions:**
```typescript
// CORRECT
app/(protected)/dashboard/files/_lib/server/files.loader.ts
```

### ❌ DON'T: Use localStorage for Sensitive Data

```typescript
// WRONG - sensitive data in localStorage
const [apiKeys, setApiKeys] = useLocalStorage("api-keys", []);
const [passwords, setPasswords] = useLocalStorage("passwords", []);
```

✅ **DO: Use server-side for sensitive data:**
```typescript
// CORRECT - server-side only
export async function loadApiKeys() {
  const user = await getCurrentServerUser();
  return service.getEncryptedKeys(user.id);
}
```

---

## Checklist

### When Implementing Server-Side Data Fetching:

- [ ] Created loader in `_lib/server/{feature}.loader.ts`
- [ ] Loader calls service layer (not direct Supabase)
- [ ] page.tsx is async and calls loader
- [ ] Data passed as props to view component
- [ ] Types exported from service layer
- [ ] Error handling in loader
- [ ] Service handles business logic
- [ ] View component is client component (`"use client"`)
- [ ] Mutations use server actions (not in loader)

### When Implementing Client-Side (localStorage) Data Fetching:

- [ ] Created hook in `_lib/{feature}.hooks.ts`
- [ ] Hook uses `useLocalStorage` from shared hooks
- [ ] Hook encapsulates ALL CRUD operations
- [ ] Component delegates to hook methods (no direct state manipulation)
- [ ] No business logic in component
- [ ] Serialization/deserialization in hook or utils
- [ ] Storage key defined in `lib/storage-keys.ts`
- [ ] JSDoc documentation on hook
- [ ] Export/import functionality (if needed)
- [ ] Filtering/computed values in hook (not component)

---

## Related Patterns

- **page-composition.md** - How to structure page/view/providers layers
- **server-actions.md** - How to handle data mutations
- **hooks.md** - Guidelines for creating custom hooks
- **state-management.md** - When to use different state approaches

---

## Summary

### Core Principles (Next.js 15)

1. ⚠️ **Explicit Caching**: Next.js 15 does NOT cache by default - always specify cache behavior
2. ✅ **Server-First**: Fetch data in Server Components by default
3. ✅ **Colocation**: Fetch data where it's used (automatic deduplication)
4. ✅ **Parallel Fetching**: Use `Promise.all` for independent data
5. ✅ **Streaming**: Use Suspense for progressive rendering
6. ✅ **Server Actions**: Use for internal mutations, Route Handlers for external APIs

### This Codebase: Two Approaches

1. ✅ **Server-Side (Supabase)**: For authenticated data requiring persistence
   - Use loaders in `_lib/server/`, call services, pass props
   - Streaming with Suspense for better UX
   - Explicit caching strategies
   - Error handling with error.tsx

2. ✅ **Client-Side (localStorage)**: For UI-only state
   - Use hooks in `_lib/`, encapsulate CRUD, delegate operations
   - No business logic in components
   - Storage keys in `lib/storage-keys.ts`

### Quick Decision Guide

```
Need data persistence? → Server-Side approach
Need authentication? → Server-Side approach
Need cross-device sync? → Server-Side approach
Client-only UI state? → Client-Side (localStorage)
Need mutations? → Server Actions (internal) or Route Handlers (external)
```

### What This Pattern Ensures

- ✅ Clear separation between data fetching and UI rendering
- ✅ Consistent file organization across features
- ✅ Type-safe data flow from source to UI
- ✅ Easy discovery of data fetching logic
- ✅ Scalable architecture for new features
- ✅ Performance-optimized with streaming and caching
- ✅ Modern Next.js 15 best practices

### Key Rules

1. ⚠️ **Always explicitly choose caching strategy** in Next.js 15
2. ✅ **Never mix approaches** - choose one per feature
3. ✅ **Loaders ≠ Actions** - Loaders = queries, Actions = mutations
4. ✅ **Parallel > Sequential** - avoid request waterfalls
5. ✅ **Stream with Suspense** - better perceived performance
6. ✅ **Type safety** - export types from services, use in loaders/hooks
7. ✅ **File naming** - consistent conventions across all files

### Common Mistakes to Avoid

❌ Forgetting to specify cache behavior (Next.js 15)
❌ Sequential fetching when parallel is possible
❌ Prop drilling instead of colocation
❌ Mixing server-side and localStorage for same data
❌ Manual memoization (Next.js does it automatically)
❌ Business logic in components (should be in hooks/services)

---

## Resources

- [Next.js 15 Data Fetching Docs](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Next.js Caching Documentation](https://nextjs.org/docs/app/building-your-application/caching)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- Related patterns: `page-composition.md`, `server-actions.md`, `hooks.md`, `state-management.md`
