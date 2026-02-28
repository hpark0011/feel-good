---
name: Data Fetching Patterns
category: Architecture
applies_to: [pages, hooks, loaders, services]
updated: 2026-01-14
documented_in: CLAUDE.md
---

# Data Fetching Patterns

Comprehensive patterns for data fetching in Next.js 15 with server-side loaders, client-side localStorage hooks, and hybrid approaches.

## Quick Navigation

### Core Documentation

- **[Overview](./data-fetching/overview.md)** - Quick start, decision tree, core principles, Next.js 15 breaking changes
- **[Server-Side Patterns](./data-fetching/server-side.md)** - Loaders, streaming, Suspense, caching strategies, error handling
- **[Client-Side Patterns](./data-fetching/client-side.md)** - localStorage hooks, client-only state management
- **[Hybrid Patterns](./data-fetching/hybrid.md)** - Server + client combined for optimistic UI
- **[Server Actions vs Route Handlers](./data-fetching/server-actions-vs-routes.md)** - Choosing mutation patterns
- **[Performance & Observability](./data-fetching/performance.md)** - Monitoring, pagination, caching best practices
- **[Examples & Checklists](./data-fetching/examples.md)** - Real-world code, anti-patterns, implementation guides

---

## Quick Decision Tree

```
Need data in your component?
│
├─ Does it require authentication?
│  ├─ YES → Server-Side (Supabase)
│  │   └─ See: server-side.md
│  │
│  └─ NO → Is it user-specific persistent data?
│      ├─ YES → Server-Side (Supabase)
│      │   └─ See: server-side.md
│      │
│      └─ NO → Is it UI-only state?
│          ├─ YES → Client-Side (localStorage)
│          │   └─ See: client-side.md
│          │
│          └─ Need both server + optimistic updates?
│              └─ Hybrid Approach
│                  └─ See: hybrid.md
```

---

## Key Concepts at a Glance

### Server-Side Data Fetching

**Use when:**
- Authentication required
- Cross-device sync needed
- SEO/SSR important
- Data must persist server-side

**Pattern:**
```typescript
// page.tsx (Server Component)
export default async function Page() {
  const data = await loadData() // Loader function
  return <View data={data} />
}
```

**Learn more:** [Server-Side Patterns](./data-fetching/server-side.md)

---

### Client-Side Data Fetching

**Use when:**
- Client-only state (no auth needed)
- Offline-first functionality
- UI preferences and settings
- No cross-device sync required

**Pattern:**
```typescript
// Custom hook with localStorage
export function useFeatureData() {
  const [data, setData] = useLocalStorage(STORAGE_KEY, initial)
  // CRUD operations...
  return { data, addItem, updateItem, deleteItem }
}
```

**Learn more:** [Client-Side Patterns](./data-fetching/client-side.md)

---

### Hybrid Approach

**Use when:**
- Initial data should be server-rendered (SEO, fast first paint)
- Client-side updates need optimistic UI (instant feedback)
- Server is source of truth, but client manages state

**Pattern:**
```typescript
// Server: Initial load
export default async function Page() {
  const initialData = await loadData()
  return <View initialData={initialData} />
}

// Client: Optimistic updates
function View({ initialData }) {
  const [data, setData] = useState(initialData)
  // Optimistic updates + server actions
}
```

**Learn more:** [Hybrid Patterns](./data-fetching/hybrid.md)

---

## Critical: Next.js 15 Breaking Change

**Default caching behavior has changed.** You must explicitly opt-in to caching:

```typescript
// Next.js 15: NOT cached by default
fetch(url) // Equivalent to { cache: 'no-store' }

// Explicitly cache:
export async function getData() {
  'use cache' // Recommended approach
  const res = await fetch(url)
  return res.json()
}
```

**Learn more:** [Server-Side Patterns - Caching Strategies](./data-fetching/server-side.md#caching-strategies-nextjs-15)

---

## Common Patterns Summary

| Pattern | Use Case | File Location | Example |
|---------|----------|---------------|---------|
| **Server Loader** | Initial page data | `_lib/server/*.loader.ts` | Files module |
| **Client Hook** | localStorage state | `_lib/*.hooks.ts` | Tasks module |
| **Server Action** | Mutations (internal) | `app/_actions/*-actions.ts` | Update, delete |
| **Route Handler** | External API | `app/api/*/route.ts` | Webhooks |
| **Hybrid** | Server + optimistic UI | page.tsx + view.tsx | Comments, cart |

---

## Related Patterns

- **[Page Composition](../page-composition.md)** - Page/view/providers structure
- **[Server Actions](../server-actions.md)** - Mutation patterns and best practices
- **[Hooks](../hooks.md)** - Custom hook guidelines
- **[State Management](../state-management.md)** - Choosing state approaches

---

## Getting Started

1. **New to data fetching?** Start with **[Overview](./data-fetching/overview.md)**
2. **Need to fetch server data?** See **[Server-Side Patterns](./data-fetching/server-side.md)**
3. **Building client-only features?** See **[Client-Side Patterns](./data-fetching/client-side.md)**
4. **Want real-world examples?** See **[Examples & Checklists](./data-fetching/examples.md)**
5. **Performance concerns?** See **[Performance & Observability](./data-fetching/performance.md)**

---

## Quick Reference

### DO

✅ Choose ONE source of truth (server OR client, not both)
✅ Fetch server-side when SEO/auth matters
✅ Use localStorage for client-only UI state
✅ Encapsulate logic in hooks/loaders
✅ Use optimistic updates for better UX
✅ Paginate early (20-50 items per page)
✅ Monitor performance (log slow queries)

### DON'T

❌ Mix localStorage with server data
❌ Put business logic in components
❌ Fetch client-side when server-side is better
❌ Skip pagination on large datasets
❌ Ignore slow query warnings (>100ms)
❌ Fetch sequentially when parallel is possible

---

**For detailed implementation guides, see the individual pattern files linked above.**
