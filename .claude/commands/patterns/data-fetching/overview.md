---
name: Data Fetching Overview
category: Architecture
applies_to: [pages, hooks, loaders, services]
updated: 2026-01-14
documented_in: CLAUDE.md
parent: data-fetching.md
---

# Data Fetching Overview

Quick start guide and core principles for data fetching in Next.js 15.

## Navigation

- **[← Back to Data Fetching Index](../data-fetching.md)**
- **[Server-Side Patterns →](./server-side.md)**
- **[Client-Side Patterns →](./client-side.md)**

---

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
- See [Server-Side Patterns](./server-side.md#caching-strategies) for detailed caching strategies

---

## Core Principles

1. **Server-First**: Fetch data in Server Components by default
2. **Explicit Caching**: Always specify cache behavior in Next.js 15
3. **Colocation**: Fetch data where it's used (no prop drilling)
4. **Parallel Fetching**: Use `Promise.all` for independent data
5. **Streaming**: Use Suspense for progressive rendering
6. **Serializable Data**: Only pass JSON-serializable data to Client Components
7. **Server Actions**: Use for internal mutations, Route Handlers for external APIs

---

## Quick Decision Tree

```
Need to fetch data?
│
├─ Server persistence required? (Supabase)
│  └─ YES → Use Server-Side approach (Loader Pattern)
│           ├─ page.tsx → loader.ts → service.ts → Supabase
│           └─ Pass data as props to view component
│           📖 See: server-side.md
│
└─ NO → Client-only state?
    └─ YES → Use Client-Side approach (localStorage)
             ├─ Component → useFeatureData hook → useLocalStorage
             └─ All CRUD in hook, component only renders
             📖 See: client-side.md
```

---

## Common Patterns

### Server Component: Fetch Data

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
```

### Client Component: Receive Data

```typescript
// Client Component: Receive data
'use client'
export function View({ user, posts }) {
  // Handle interactivity, call Server Actions for mutations
  return <div>{/* UI */}</div>
}
```

---

## Two Complementary Approaches

The application uses **two complementary data fetching approaches**:

1. **[Server-Side Data Fetching](./server-side.md)** - For authenticated data requiring Supabase persistence
2. **[Client-Side Data Fetching](./client-side.md)** - For localStorage-based client-only features

Each approach has specific file organization, naming conventions, and use cases.

### When to Use Server-Side

✅ Use server-side data fetching when:
- Data requires authentication (user-specific data)
- Data needs server persistence (Supabase)
- Cross-device synchronization is needed
- SEO/SSR is important
- Data should be fetched at page load

📖 **Learn more**: [Server-Side Patterns](./server-side.md)

### When to Use Client-Side

✅ Use client-side localStorage when:
- Data is client-only (no server persistence needed)
- Offline-first functionality is required
- Rapid iteration without backend changes
- Data doesn't require authentication
- Cross-device sync is NOT needed

📖 **Learn more**: [Client-Side Patterns](./client-side.md)

### Hybrid Approach

For features that need both server rendering and client-side updates:

📖 **Learn more**: [Hybrid Patterns](./hybrid.md)

---

## Related Topics

- **[Server-Side Patterns](./server-side.md)** - Loaders, caching, streaming, error handling
- **[Client-Side Patterns](./client-side.md)** - localStorage hooks, client-only state
- **[Hybrid Patterns](./hybrid.md)** - Server + client combined approach
- **[Server Actions vs Route Handlers](./server-actions-vs-routes.md)** - Choosing mutation patterns
- **[Performance & Observability](./performance.md)** - Optimization and monitoring
- **[Examples & Checklists](./examples.md)** - Code examples, anti-patterns, checklists

---

## Related Patterns

- **[page-composition.md](../page-composition.md)** - Page/view/providers structure
- **[server-actions.md](../server-actions.md)** - Mutation patterns
- **[hooks.md](../hooks.md)** - Custom hook guidelines
- **[state-management.md](../state-management.md)** - State approaches
