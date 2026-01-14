---
name: Hybrid Data Fetching
category: Architecture
applies_to: [pages, hooks, actions]
updated: 2026-01-14
documented_in: CLAUDE.md
parent: data-fetching.md
---

# Hybrid Data Fetching (Server + Client)

Combining server-side rendering with client-side updates for the best of both worlds.

## Navigation

- **[← Back to Overview](./overview.md)**
- **[Server-Side Patterns →](./server-side.md)**
- **[Client-Side Patterns →](./client-side.md)**

---

## When to Use

✅ Use hybrid approach when:
- Initial data should be server-rendered (SEO, fast first paint)
- Client-side updates need optimistic UI (instant feedback)
- Real-time features with server synchronization
- Progressive enhancement pattern (works without JS, better with JS)

---

## Pattern

### page.tsx (Server Component)

**Purpose**: Server-render initial data for fast first paint and SEO.

```typescript
import { FeatureView } from "./_view/feature-view";
import { loadInitialData } from "./_lib/server/feature.loader";

export default async function FeaturePage() {
  // Server-side initial load
  const initialData = await loadInitialData();

  return <FeatureView initialData={initialData} />;
}
```

---

### feature-view.tsx (Client Component)

**Purpose**: Manage client-side state and optimistic updates.

```typescript
"use client";

import { useState, useTransition } from "react";
import { updateAction } from "@/app/_actions/feature-actions";

interface FeatureViewProps {
  initialData: FeatureData[];
}

export function FeatureView({ initialData }: FeatureViewProps) {
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = async (id: string, updates: Partial<FeatureData>) => {
    // 1. Optimistic update (instant UI feedback)
    setData(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));

    // 2. Server mutation (persist changes)
    startTransition(async () => {
      const result = await updateAction({ id, updates });

      if (!result.success) {
        // Revert on error
        setData(initialData);
        toast.error(result.message);
      } else {
        // Use server data (source of truth)
        setData(result.data);
      }
    });
  };

  return (
    <div>
      {data.map(item => (
        <ItemCard
          key={item.id}
          item={item}
          onUpdate={(updates) => handleUpdate(item.id, updates)}
          isPending={isPending}
        />
      ))}
    </div>
  );
}
```

---

## Data Flow

```
1. Initial Page Load (Server)
   ┌─────────────────────────────────┐
   │ page.tsx (Server Component)     │
   │ - await loadInitialData()       │
   └─────────────┬───────────────────┘
                 │ Server-rendered HTML with data
                 ↓
   ┌─────────────────────────────────┐
   │ Browser receives HTML           │
   │ - Instant first paint           │
   │ - SEO-friendly                  │
   └─────────────┬───────────────────┘
                 │ Hydration
                 ↓
   ┌─────────────────────────────────┐
   │ FeatureView (Client Component)  │
   │ - useState(initialData)         │
   │ - Interactive                   │
   └─────────────────────────────────┘

2. User Interaction (Client)
   ┌─────────────────────────────────┐
   │ User clicks "Update"            │
   └─────────────┬───────────────────┘
                 │
                 ↓
   ┌─────────────────────────────────┐
   │ Optimistic UI Update            │
   │ - setData() immediately         │
   │ - User sees instant feedback    │
   └─────────────┬───────────────────┘
                 │
                 ↓
   ┌─────────────────────────────────┐
   │ Server Action                   │
   │ - updateAction({ id, updates }) │
   │ - Persists to database          │
   └─────────────┬───────────────────┘
                 │
                 ↓
   ┌─────────────────────────────────┐
   │ Success?                        │
   ├─ ✅ Yes → setData(result.data)  │
   └─ ❌ No  → setData(initialData)  │
      (revert to server state)       │
   └─────────────────────────────────┘
```

---

## Benefits

### 1. **Fast First Paint**
- Server renders initial HTML with data
- No loading spinner on first visit
- SEO-friendly (search engines see content)

### 2. **Instant Feedback**
- Optimistic updates feel instant
- No waiting for server round-trip
- Better perceived performance

### 3. **Server as Source of Truth**
- Server validation on all mutations
- Client reverts on error
- Prevents invalid state

### 4. **Progressive Enhancement**
- Works without JavaScript (server HTML)
- Enhanced with JavaScript (interactivity)
- Graceful degradation

---

## Use Cases

### E-commerce Cart
```typescript
// Server: Load cart from database
export default async function CartPage() {
  const cart = await loadCart()
  return <CartView initialCart={cart} />
}

// Client: Optimistic updates for quantity changes
export function CartView({ initialCart }) {
  const [cart, setCart] = useState(initialCart)

  const updateQuantity = (itemId, quantity) => {
    // Instant UI update
    setCart(prev => updateItemQuantity(prev, itemId, quantity))

    // Persist to server
    updateCartAction({ itemId, quantity })
  }
}
```

### Real-Time Comments
```typescript
// Server: Initial comments
export default async function PostPage() {
  const comments = await loadComments()
  return <CommentsView initialComments={comments} />
}

// Client: Optimistic new comments + real-time updates
export function CommentsView({ initialComments }) {
  const [comments, setComments] = useState(initialComments)

  const addComment = async (text) => {
    // Optimistic: Add immediately
    const tempComment = { id: 'temp', text, createdAt: new Date() }
    setComments(prev => [...prev, tempComment])

    // Server: Persist and get real ID
    const result = await createCommentAction({ text })
    setComments(prev => prev.map(c =>
      c.id === 'temp' ? result.comment : c
    ))
  }
}
```

---

## Best Practices

### 1. **Always Revert on Error**

```typescript
// ✅ GOOD: Revert to server state on error
const handleUpdate = async (id, updates) => {
  setData(optimisticUpdate(data, id, updates))

  const result = await updateAction({ id, updates })
  if (!result.success) {
    setData(initialData) // Revert
  }
}

// ❌ BAD: Leave optimistic state even on error
const handleUpdate = async (id, updates) => {
  setData(optimisticUpdate(data, id, updates))
  await updateAction({ id, updates }) // What if it fails?
}
```

### 2. **Use Server Data as Truth**

```typescript
// ✅ GOOD: Use server's returned data
const result = await updateAction({ id, updates })
if (result.success) {
  setData(result.data) // Server's version
}

// ❌ BAD: Keep client's optimistic state
const result = await updateAction({ id, updates })
if (result.success) {
  // Keep optimistic state (might be stale)
}
```

### 3. **Show Pending State**

```typescript
// ✅ GOOD: Visual feedback for pending mutations
const [isPending, startTransition] = useTransition()

<ItemCard item={item} isPending={isPending} />

// ❌ BAD: No feedback for pending operations
// (user might click multiple times)
```

---

## See Also

- **[Overview](./overview.md)** - Quick start and decision tree
- **[Server-Side Patterns](./server-side.md)** - Server-only approach
- **[Client-Side Patterns](./client-side.md)** - Client-only approach
- **[Server Actions vs Routes](./server-actions-vs-routes.md)** - Choosing mutation patterns
- **[Examples](./examples.md)** - Real-world examples
