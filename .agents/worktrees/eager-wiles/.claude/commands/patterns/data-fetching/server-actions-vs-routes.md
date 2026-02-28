---
name: Server Actions vs Route Handlers
category: Architecture
applies_to: [actions, routes, mutations]
updated: 2026-01-14
documented_in: CLAUDE.md
parent: data-fetching.md
---

# Server Actions vs Route Handlers

Choosing between Server Actions and Route Handlers for data mutations.

## Navigation

- **[← Back to Overview](./overview.md)**
- **[Server-Side Patterns](./server-side.md)**
- **[Examples →](./examples.md)**

---

## The Question

**"When should I use Server Actions vs Route Handlers (API routes)?"**

This is a common question when building Next.js applications. Both can handle mutations, but they serve different purposes.

---

## Quick Decision

### Use Server Actions when:

- ✅ **Internal app operations** (forms, mutations within your Next.js app)
- ✅ **Direct component integration** (called from Client Components)
- ✅ **Type-safe function calls** (TypeScript end-to-end)
- ✅ **Simple data mutations** (create, update, delete)
- ✅ **Automatic POST handling** (no need to specify HTTP method)

### Use Route Handlers when:

- ✅ **External API access** (webhooks, third-party integrations)
- ✅ **Public endpoints** (need explicit URL)
- ✅ **Non-Next.js clients** (mobile apps, external services)
- ✅ **Need explicit HTTP control** (GET, POST, PUT, DELETE, custom headers)
- ✅ **Multiple HTTP methods on same endpoint** (GET + POST + PUT on `/api/products`)

---

## Rule of Thumb

```
Internal operations → Server Actions
External access → Route Handlers
```

**Why?**
- Server Actions are optimized for Next.js internal use (type safety, direct imports)
- Route Handlers are standard HTTP endpoints (accessible from anywhere)

---

## Examples

### Server Action (Internal Mutation)

**File**: `app/_actions/product-actions.ts`

```typescript
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
```

**Usage in component:**

```typescript
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

**Advantages:**
- ✅ Type-safe imports
- ✅ No need to define HTTP method
- ✅ Automatic cache revalidation
- ✅ Direct function call (no fetch)
- ✅ Works seamlessly with forms

---

### Route Handler (External API)

**File**: `app/api/products/route.ts`

```typescript
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

**Usage from external client:**

```typescript
// Mobile app, webhook, or external service
const response = await fetch('https://myapp.com/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Widget', price: 9.99 })
})
```

**Advantages:**
- ✅ Standard REST API
- ✅ Multiple HTTP methods (GET, POST, PUT, DELETE)
- ✅ Custom headers and status codes
- ✅ Accessible from any client
- ✅ Can be documented with OpenAPI

---

## Integration Pattern

### Complete Data Flow

```
┌─────────────────────────────────────────┐
│ Initial Page Load                       │
│ page.tsx → loader.ts → service.ts       │
│ (Server-Side Rendering)                 │
└────────────────┬────────────────────────┘
                 │ Props ↓
┌─────────────────────────────────────────┐
│ View Component (Client)                 │
│ - Receives initial data                 │
│ - Renders UI                            │
└────────────────┬────────────────────────┘
                 │ User Action ↓
┌─────────────────────────────────────────┐
│ Mutation (Choose One)                   │
│                                         │
│ Option A: Server Action                │
│ ├─ Internal app operation               │
│ ├─ Direct import                        │
│ └─ feature-actions.ts                   │
│                                         │
│ Option B: Route Handler                │
│ ├─ External API needed                  │
│ ├─ fetch() call                         │
│ └─ app/api/feature/route.ts             │
└─────────────────────────────────────────┘
```

---

## Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Loader | `{feature}.loader.ts` | `files.loader.ts` |
| Server Action | `{feature}-actions.ts` | `file-actions.ts` |
| Route Handler | `app/api/{feature}/route.ts` | `app/api/files/route.ts` |
| Service | `{feature}.service.ts` | `file.service.ts` |

---

## When to Use Which Approach

| Requirement | Server-Side | Client-Side | Hybrid |
|-------------|-------------|-------------|--------|
| Server persistence | ✅ Required | ❌ No | ✅ Yes |
| Authentication | ✅ Yes | ⚠️ UI only | ✅ Yes |
| Cross-device sync | ✅ Yes | ❌ No | ✅ Yes |
| Offline-first | ❌ No | ✅ Yes | ⚠️ Partial |
| SEO/SSR | ✅ Yes | ❌ No | ✅ Yes |
| Optimistic UI | ⚠️ Complex | ✅ Easy | ✅ Built-in |

---

## Recommended Pattern

**For this codebase:**

1. **Loaders** → Initial data fetching (page load)
2. **Server Actions** → Internal data mutations (user actions)
3. **Route Handlers** → External API access (webhooks, mobile apps)
4. **View** → Optimistic updates + action calls

---

## Example Integration

```typescript
// 1. Loader fetches initial data (page.tsx)
const initialFiles = await loadFiles();

// 2. View manages state (feature-view.tsx)
<FilesView
  initialFiles={initialFiles}
  onUpload={uploadFileAction}    // Server Action (internal)
  onDelete={deleteFileAction}    // Server Action (internal)
/>

// 3. External webhook uses Route Handler
// POST /api/webhooks/file-processed
// (accessible from external services)
```

---

## Common Mistakes

### ❌ Using Route Handlers for Internal Forms

```typescript
// DON'T: Unnecessary complexity
export function ProductForm() {
  const handleSubmit = async (e) => {
    e.preventDefault()
    const response = await fetch('/api/products', {
      method: 'POST',
      body: JSON.stringify({ name, price })
    })
  }
}

// DO: Use Server Action directly
export function ProductForm() {
  return (
    <form action={createProductAction}>
      {/* ... */}
    </form>
  )
}
```

### ❌ Using Server Actions for External APIs

```typescript
// DON'T: Server Actions aren't accessible externally
'use server'
export async function webhookHandler(data) {
  // External webhook can't call this!
}

// DO: Use Route Handler for webhooks
export async function POST(request: Request) {
  // Accessible at /api/webhooks
}
```

---

## See Also

- **[Overview](./overview.md)** - Quick start and decision tree
- **[Server-Side Patterns](./server-side.md)** - Loader pattern details
- **[Hybrid Patterns](./hybrid.md)** - Optimistic UI with Server Actions
- **[server-actions.md](../server-actions.md)** - Detailed Server Actions patterns
- **[Examples](./examples.md)** - Real-world implementation examples
