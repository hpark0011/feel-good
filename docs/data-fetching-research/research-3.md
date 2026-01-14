1. Default to Server Components for data fetching
   • Fetch data in the server layer (Server Components / route handlers / server actions).
   • Pass plain data (JSON-serializable) down to UI components as props.
   • This gives you: faster initial load, smaller client bundles, fewer “loading spinners,” and keeps secrets off the client.

Pattern
• app/page.tsx (Server Component) fetches
• components/\*.tsx renders (can be server or client)

2. Choose the right place to fetch based on “who needs it”

A good rule: fetch as close as possible to where it’s used, but no closer than necessary.
• Page-level fetch: data used across many sections of the page (header + list + sidebar).
• Component-level fetch (still Server Component): data used by a single section (e.g., “Recommended” module).
• Client fetch: only when it must update from user interaction without navigation (live search, infinite scroll, realtime).

3. Use Next’s caching controls intentionally

You basically decide: “Should this be cached? For how long? Or never?”
• Static-ish data (marketing content, catalogs that update rarely):
• Use next: { revalidate: N } (ISR-style)
• User-specific data (dashboard, permissions):
• Usually cache: 'no-store' (or fetch from an authenticated server-only source)
• Truly dynamic (real-time):
• cache: 'no-store' + client refresh or streaming UI

Heuristic
• If the response depends on cookies/auth header/user → avoid caching globally.

4. Deduplicate and compose fetches cleanly

On the server, if multiple components fetch the same resource, you want:
• one source of truth
• predictable caching
• fewer network calls

Best approach:
• Create small data functions in lib/data/\* (server-only modules)
• Call them from pages/components

Example structure:
• lib/data/users.ts
• lib/data/posts.ts
• lib/db.ts

5. Avoid “waterfalls” by fetching in parallel

If you need multiple independent queries:
• Use Promise.all in the server component.
• Keep dependent fetches sequential, but try to minimize dependency chains.

6. Stream the UI with loading.tsx and Suspense

Instead of waiting for all data before showing anything:
• Use app/segment/loading.tsx for route-level loading UI
• Use <Suspense> for component-level streaming if you split data fetching per section

This produces “instant shell + fill in data” without pushing everything to the client.

7. Pass data to Client Components thoughtfully

Client Components can only receive serializable props.
• ✅ arrays/objects of primitives, plain JSON
• ❌ Dates (convert to string), Maps/Sets, class instances, DB clients, functions

Best practice:
• Convert on the server (toISOString(), Number(), etc.)
• Keep Client Components focused on interactivity, not owning core data fetching.

8. Use Server Actions / Route Handlers for mutations
   • Reads: Server Components (or route handlers if you’re building an API)
   • Writes: Server Actions (preferred for form-like mutations) or route handlers (for external clients / webhooks)

Best practice:
• After a mutation, invalidate caches with tags or revalidatePath/revalidateTag (depending on your setup) so the UI updates correctly.

9. Handle errors and empty states explicitly
   • Add error.tsx per route segment
   • In components, handle:
   • “no data” (empty list)
   • “not found”
   • “permission denied”
   • Don’t rely on exceptions for normal empty states.

10. For client-side fetching, use a real query/cache library

If you truly need client fetching (filters, live search, infinite scroll):
• Use TanStack Query (React Query) or SWR
• Benefits: caching, deduping, retries, background refresh, optimistic updates

Best practice:
• Still keep your “source of truth” server-side when possible (e.g., page loads server-rendered, client enhances with query library for interaction).

11. Keep an API boundary when it helps

Even in a Next app, sometimes a clean boundary improves maintainability:
• app/api/\* route handlers as a stable API (esp. if mobile or external clients will use it)
• But if only your Next UI uses it, you often don’t need an internal REST layer—direct server functions are simpler and faster.

12. Observability + performance basics
    • Log slow queries on the server
    • Cache expensive derived computations
    • Avoid fetching massive payloads—select only fields needed for the view
    • Paginate lists early (cursor pagination if possible)
