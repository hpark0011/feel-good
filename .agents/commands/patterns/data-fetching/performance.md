---
name: Performance & Observability
category: Architecture
applies_to: [performance, monitoring, optimization]
updated: 2026-01-14
documented_in: CLAUDE.md
parent: data-fetching.md
---

# Performance & Observability

System-wide performance practices and monitoring strategies for data fetching.

## Navigation

- **[← Back to Overview](./overview.md)**
- **[Server-Side Patterns](./server-side.md)** (includes performance best practices)
- **[Examples →](./examples.md)**

---

## Overview

Beyond individual data fetching patterns, consider these system-wide practices to ensure optimal performance and observability.

---

## 1. Request Deduplication (Automatic)

Next.js automatically deduplicates identical `fetch` requests within a single render pass. **You don't need to do anything** - just fetch where you need data.

### How It Works

```typescript
// All three components fetch the same data
// Result: Only ONE network request
<UserProfile />  {/* fetch('/api/user') */}
<UserSettings /> {/* fetch('/api/user') - deduplicated! */}
<UserStats />    {/* fetch('/api/user') - deduplicated! */}
```

### Benefits

- ✅ No need to fetch at top level and prop drill
- ✅ Each component can fetch what it needs
- ✅ Next.js handles deduplication automatically
- ✅ Cleaner, more maintainable code

### What Gets Deduplicated

```typescript
// Same URL + same options = deduplicated
const data1 = await fetch('/api/users')
const data2 = await fetch('/api/users') // Deduplicated

// Different options = separate requests
const data3 = await fetch('/api/users', { cache: 'no-store' })
const data4 = await fetch('/api/users') // NOT deduplicated (different options)
```

**Note**: Deduplication only applies within a single React render pass. Across different page loads or mutations, requests are separate.

---

## 2. Monitoring Slow Queries

Add timing instrumentation to loaders to identify performance bottlenecks:

### Basic Timing

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

### Advanced Timing with Details

```typescript
export async function loadUserDashboard(userId: string) {
  const start = Date.now()

  try {
    const data = await fetchDashboardData(userId)
    const duration = Date.now() - start

    // Log slow queries with context
    if (duration > 100) {
      console.warn('[Performance]', {
        function: 'loadUserDashboard',
        userId,
        duration: `${duration}ms`,
        threshold: '100ms',
      })
    }

    return data
  } catch (error) {
    const duration = Date.now() - start
    console.error('[Performance] Failed query', {
      function: 'loadUserDashboard',
      userId,
      duration: `${duration}ms`,
      error: error.message,
    })
    throw error
  }
}
```

### Recommended Thresholds

| Query Type | Threshold | Action |
|------------|-----------|--------|
| Simple lookup | 50ms | Warn if exceeded |
| Join queries | 100ms | Warn if exceeded |
| Complex aggregation | 200ms | Warn if exceeded |
| Batch operations | 500ms | Warn if exceeded |

---

## 3. Pagination Strategy

Always paginate lists early. Prefer cursor-based pagination for scalability.

### Cursor-Based Pagination

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
    nextCursor: data[data.length - 1]?.created_at,
    hasMore: data.length === limit,
  }
}
```

### Offset-Based Pagination (Alternative)

```typescript
export async function loadPaginatedItems(
  page: number = 1,
  pageSize: number = 20
) {
  const supabase = await getSupabaseServerClient()

  const { data, error, count } = await supabase
    .from('items')
    .select('*', { count: 'exact' })
    .range((page - 1) * pageSize, page * pageSize - 1)

  return {
    items: data,
    totalCount: count,
    currentPage: page,
    totalPages: Math.ceil(count / pageSize),
  }
}
```

### Which to Use?

| Pagination Type | Best For | Pros | Cons |
|-----------------|----------|------|------|
| **Cursor-based** | Infinite scroll, real-time feeds | Fast, consistent | Can't jump to page N |
| **Offset-based** | Traditional pagination | Can jump pages | Slower on large datasets |

---

## 4. Field Selection

Only select the fields you need to reduce data transfer and processing time.

### Bad: Fetching Everything

```typescript
// ❌ BAD: Fetching entire user objects
const users = await db.users.findMany()
// Returns: id, name, email, bio, avatar_url, created_at, updated_at, etc.
```

### Good: Select Specific Fields

```typescript
// ✅ GOOD: Select only required fields
const users = await db.users.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    // Exclude large fields (bio, avatar_url, etc.)
  }
})
```

### Supabase Example

```typescript
// ❌ BAD
const { data } = await supabase
  .from('posts')
  .select('*')

// ✅ GOOD
const { data } = await supabase
  .from('posts')
  .select('id, title, excerpt, created_at')
```

### Performance Impact

| Dataset Size | All Fields | Selected Fields | Improvement |
|--------------|-----------|----------------|-------------|
| 100 rows | 150 KB | 45 KB | 70% faster |
| 1,000 rows | 1.5 MB | 450 KB | 70% faster |
| 10,000 rows | 15 MB | 4.5 MB | 70% faster |

---

## 5. Cache Expensive Operations

Use React's `cache` for expensive transformations that don't change during a request:

### Basic Caching

```typescript
import { cache } from 'react'

export const getProcessedData = cache(async () => {
  const raw = await getRawData()
  return expensiveTransformation(raw) // Only runs once per request
})
```

### Multiple Components Using Same Data

```typescript
import { cache } from 'react'

// Cache the expensive operation
export const getStatsData = cache(async () => {
  const data = await fetchRawData()
  return calculateComplexStatistics(data) // Expensive CPU operation
})

// Component A
async function DashboardStats() {
  const stats = await getStatsData() // Runs transformation
  return <div>{stats.total}</div>
}

// Component B
async function DetailedStats() {
  const stats = await getStatsData() // Returns cached result!
  return <div>{stats.breakdown}</div>
}
```

### When to Use

- ✅ Expensive data transformations
- ✅ Complex calculations (statistics, aggregations)
- ✅ Data that doesn't change during request
- ❌ Data that needs to be fresh on each call
- ❌ User-specific data with different inputs

---

## 6. Observability Checklist

Implement these practices to maintain visibility into your application's performance:

### Essential Monitoring

- [ ] **Log slow queries** (>100ms threshold)
  ```typescript
  if (duration > 100) {
    console.warn(`Slow query: ${functionName} took ${duration}ms`)
  }
  ```

- [ ] **Monitor cache hit rates** (for custom caching)
  ```typescript
  const hitRate = (cacheHits / totalRequests) * 100
  console.info(`Cache hit rate: ${hitRate}%`)
  ```

- [ ] **Track data fetching errors**
  ```typescript
  try {
    return await fetchData()
  } catch (error) {
    console.error('Data fetch error:', { function, error })
    throw error
  }
  ```

- [ ] **Measure page load times** (Core Web Vitals)
  - LCP (Largest Contentful Paint) < 2.5s
  - FID (First Input Delay) < 100ms
  - CLS (Cumulative Layout Shift) < 0.1

- [ ] **Alert on performance regressions**
  - Set up alerts for queries > threshold
  - Monitor p95 and p99 response times
  - Track error rates

- [ ] **Profile production queries periodically**
  - Review slow query logs weekly
  - Identify optimization opportunities
  - Add indexes where needed

### Tools & Services

**Local Development:**
- React DevTools Profiler
- Chrome DevTools Network tab
- Next.js build analyzer

**Production Monitoring:**
- Vercel Analytics (if using Vercel)
- Sentry (error tracking)
- LogRocket (session replay)
- DataDog / New Relic (APM)

---

## Performance Patterns Summary

### DO

✅ Leverage automatic request deduplication
✅ Log slow queries with timing
✅ Paginate early (20-50 items per page)
✅ Select only required fields
✅ Cache expensive transformations
✅ Monitor production performance
✅ Use parallel fetching for independent data

### DON'T

❌ Fetch entire objects when you need few fields
❌ Create manual caching (Next.js handles it)
❌ Skip pagination on large datasets
❌ Ignore slow query warnings
❌ Fetch sequentially when parallel is possible
❌ Skip monitoring in production

---

## See Also

- **[Overview](./overview.md)** - Quick start guide
- **[Server-Side Patterns](./server-side.md)** - Includes performance best practices
- **[Client-Side Patterns](./client-side.md)** - Client performance tips
- **[Examples](./examples.md)** - Real-world optimization examples
