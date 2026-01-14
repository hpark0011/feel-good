In modern Next.js development (specifically with the App Router), the paradigm has shifted from client-side fetching to Server-First data fetching. This approach leverages React Server Components (RSC) to handle the "heavy lifting" on the server.Here are the best practices for fetching and passing data in a Next.js application.1. Fetch Where You Use It (Colocation)Gone are the days of fetching all data in a top-level getServerSideProps and drilling it down.Best Practice: Fetch data directly inside the Server Component that needs it.Why: Next.js automatically memoizes fetch requests. If three different components call the same API, Next.js will only execute the network request once.TypeScript// app/products/[id]/page.tsx
async function ProductDetails({ id }) {
const product = await fetch(`https://api.example.com/products/${id}`).then(res => res.json());
return <h1>{product.name}</h1>;
} 2. Passing Data from Server to ClientWhen you need interactivity (e.g., a search bar or a "like" button), you must pass data from a Server Component to a Client Component.Serialization Rule: Only serializable data can be passed as props (strings, numbers, objects, arrays). You cannot pass functions or Class instances.Security: Use the experimental_taintObjectReference or experimental_taintUniqueValue APIs to prevent sensitive data (like API keys or hashes) from accidentally being passed to the client.3. Use Streaming and SuspenseTo prevent a slow data fetch from blocking the entire page load, use Streaming.Pattern: Wrap slow-loading components in a <Suspense> boundary. The rest of the page will load instantly, and the specific component will "stream" in once its data is ready.TypeScriptimport { Suspense } from 'react';
import { Skeleton } from './ui/skeletons';

export default function Page() {
return (
<section>
<h1>My Dashboard</h1>
<Suspense fallback={<Skeleton />}>
<SlowDataComponent />
</Suspense>
</section>
);
} 4. Parallel vs. Sequential FetchingPerformance often hinges on how you structure your await calls.Avoid Waterfalls: Don't await one fetch, then another, if they don't depend on each other.Best Practice: Use Promise.all() to initiate requests in parallel.PatternCode StylePerformanceSequentialconst a = await getA(); const b = await getB();Slower (Total time = A + B)Parallelconst [a, b] = await Promise.all([getA(), getB()]);Faster (Total time = Max(A, B))5. Caching Strategies (Next.js 15+)In Next.js 15, fetch requests are not cached by default (cache: 'no-store'). You must be intentional about your strategy:Static Data: Use { cache: 'force-cache' } for data that rarely changes.Revalidation: Use next: { revalidate: 3600 } (ISR) to refresh data every hour.Direct DB Access: If using an ORM (Prisma/Drizzle), wrap your query in the cache function from React or use unstable_cache.Summary Checklist[ ] Is the component a Server Component by default?[ ] Is the data fetching colocated with the UI?[ ] Have you used Suspense for components with slow network requests?[ ] Are you using Promise.all() for independent fetches?[ ] Is sensitive data protected from being passed to the "use client" boundary?
