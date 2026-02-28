---
name: Client-Side Data Fetching
category: Architecture
applies_to: [hooks, localStorage, components]
updated: 2026-01-14
documented_in: CLAUDE.md
parent: data-fetching.md
---

# Client-Side Data Fetching (localStorage)

Patterns for client-side data fetching using localStorage for client-only state that doesn't require server persistence.

## Navigation

- **[← Back to Overview](./overview.md)**
- **[Server-Side Patterns →](./server-side.md)**
- **[Hybrid Patterns →](./hybrid.md)**

---

## When to Use

✅ Use client-side localStorage when:
- Data is client-only (no server persistence needed)
- Offline-first functionality is required
- Rapid iteration without backend changes
- Data doesn't require authentication
- Cross-device sync is NOT needed

---

## File Organization

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

---

## Hook Pattern

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

---

## Usage in Component

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

---

## Data Flow: Client-Side (localStorage)

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

## Best Practices

### 1. Encapsulate ALL CRUD in Hook

```typescript
// ✅ GOOD: All operations in hook
export function useFeatureData() {
  const addItem = useCallback(/*...*/)
  const updateItem = useCallback(/*...*/)
  const deleteItem = useCallback(/*...*/)
  
  return { data, addItem, updateItem, deleteItem }
}

// ❌ BAD: Direct state manipulation in component
export function Component() {
  const [data, setData] = useLocalStorage(/*...*/)
  const addItem = (item) => {
    setData([...data, item]) // Business logic in component!
  }
}
```

### 2. Use Centralized Storage Keys

```typescript
// lib/storage-keys.ts
export const STORAGE_KEYS = {
  FEATURE: {
    DATA: "docgen.v1.feature.data",
    SETTINGS: "docgen.v1.feature.settings",
  }
}

// ✅ Use in hooks
useLocalStorage(STORAGE_KEYS.FEATURE.DATA, /*...*/)
```

### 3. Serialize/Deserialize for Type Safety

```typescript
// feature.utils.ts
export function serializeData(data: FeatureData): string {
  return JSON.stringify(data)
}

export function deserializeData(json: string): FeatureData {
  const parsed = JSON.parse(json)
  // Add validation/type coercion here
  return parsed
}
```

### 4. Delegate to Hook Methods

```typescript
// ✅ GOOD: Component delegates to hook
export function Component() {
  const { data, addItem } = useFeatureData()
  
  return <button onClick={() => addItem({...})}>Add</button>
}

// ❌ BAD: Component has business logic
export function Component() {
  const { data, setData } = useFeatureData()
  
  const handleAdd = () => {
    const item = { id: Date.now(), /*...*/ } // Business logic!
    setData([...data, item])
  }
}
```

---

## See Also

- **[Overview](./overview.md)** - Quick start and decision tree
- **[Server-Side Patterns](./server-side.md)** - Server-side approach
- **[Hybrid Patterns](./hybrid.md)** - Server + client combined
- **[Examples](./examples.md)** - Real-world examples (Tasks module)
- **[hooks.md](../hooks.md)** - Custom hook guidelines
