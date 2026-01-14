---
name: Data Fetching Pattern
category: Architecture
applies_to: [pages, hooks, loaders, services]
updated: 2026-01-14
documented_in: CLAUDE.md
---

# Data Fetching Pattern

This document defines comprehensive patterns for data fetching in the Greyboard codebase. It covers server-side loaders, client-side localStorage hooks, and when to use each approach.

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
│ - See server-actions-pattern.md                         │
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

## Integration with Server Actions

**Server actions handle mutations** (POST/PUT/DELETE), while loaders handle queries (GET).

**Pattern:**
- **Loaders** → Initial data fetching (page load)
- **Server Actions** → Data mutations (user actions)
- **View** → Optimistic updates + action calls

**See:** `server-actions-pattern.md` for detailed mutation patterns.

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

## Examples from Codebase

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

- **page-composition-pattern.md** - How to structure page/view/providers layers
- **server-actions-pattern.md** - How to handle data mutations
- **hooks-pattern.md** - Guidelines for creating custom hooks
- **state-management-pattern.md** - When to use different state approaches

---

## Summary

**Key Takeaways:**

1. ✅ **Two approaches:** Server-side (Supabase) and Client-side (localStorage)
2. ✅ **Server-side:** Use loaders in `_lib/server/`, call services, pass props
3. ✅ **Client-side:** Use hooks in `_lib/`, encapsulate CRUD, delegate operations
4. ✅ **When in doubt:** Server-side for authenticated data, client-side for UI state
5. ✅ **Never mix:** Choose one approach per feature
6. ✅ **Loaders ≠ Actions:** Loaders = queries, Actions = mutations
7. ✅ **Type safety:** Export types from services, use in loaders/hooks
8. ✅ **File naming:** Consistent conventions across all files

This pattern ensures:
- Clear separation between data fetching and UI rendering
- Consistent file organization across features
- Type-safe data flow from source to UI
- Easy discovery of data fetching logic
- Scalable architecture for new features
