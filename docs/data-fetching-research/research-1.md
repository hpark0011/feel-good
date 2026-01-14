Here are some best practices for fetching data and passing it to views in Next.js applications:
Server-Side Data Fetching (Recommended)
Use Server Components by default - In Next.js 13+ with the App Router, fetch data directly in Server Components. This keeps your data fetching logic close to where it's used and reduces client-side JavaScript:
tsxasync function ProductPage({ params }) {
const product = await fetch(`https://api.example.com/products/${params.id}`)
.then(res => res.json());

return <ProductView product={product} />;
}
Leverage built-in caching - Next.js automatically caches fetch requests on the server. You can control this behavior:
tsx// Revalidate every hour
fetch(url, { next: { revalidate: 3600 } })

// Never cache (always fresh)
fetch(url, { cache: 'no-store' })
Data Fetching Patterns
Fetch data where you need it - Don't prop-drill data through multiple components. Each Server Component can fetch its own data independently, and Next.js will automatically deduplicate identical requests.
Parallel vs. Sequential fetching - For independent data, fetch in parallel:
tsx// Good - parallel fetching
const [user, posts] = await Promise.all([
fetchUser(),
fetchPosts()
]);

// Avoid - sequential (slower)
const user = await fetchUser();
const posts = await fetchPosts();
Use streaming for slow data - Use Suspense boundaries to stream UI while slower data loads:
tsx<Suspense fallback={<Skeleton />}>
<SlowDataComponent />
</Suspense>
Client-Side Data Fetching
Use SWR or React Query for client state - For client-side data fetching, use libraries that handle caching, revalidation, and error handling:
tsx'use client'
import useSWR from 'swr'

function Profile() {
const { data, error, isLoading } = useSWR('/api/user', fetcher)
// ... render logic
}
Reserve client fetching for user interactions - Use client-side fetching for data that depends on user actions, real-time updates, or browser-only APIs.
Error Handling
Implement error boundaries - Use error.tsx files in your route segments to handle errors gracefully, and loading.tsx for loading states.
Handle errors at appropriate levels - Catch and handle errors where you have the context to provide meaningful feedback to users.
These patterns help you build faster, more maintainable Next.js applications by leveraging server-side rendering, automatic request deduplication, and smart caching strategies.
