---
title: "feat: Article List with Infinite Scroll"
type: feat
date: 2026-02-08
app: mirror
---

# feat: Article List with Infinite Scroll

## Overview

Add a paginated article list with infinite scroll beneath the existing profile section on Mirror's dashboard page. This is a frontend prototype using mock data — no backend integration yet.

The article list displays title, published date (absolute format), and category. Clicking an article navigates to a placeholder detail page. Articles load 10 at a time via infinite scroll using Intersection Observer.

## Problem Statement / Motivation

The Mirror profile page currently shows only the author's profile (name, image, bio). To prototype the full public-facing experience, we need an article list that demonstrates how a reader would browse the author's published content.

## Proposed Solution

### File Structure

```
apps/mirror/app/(protected)/dashboard/
├── page.tsx                          # Existing — add ArticleListBlock
├── _view/
│   └── dashboard-view.tsx            # Existing — no changes
├── _components/
│   └── profile-image.tsx             # Existing — no changes
│
├── articles/
│   ├── _data/
│   │   └── mock-articles.ts          # 30 mock articles array + Article type
│   ├── _hooks/
│   │   └── use-article-list.ts       # Pagination state + infinite scroll logic
│   ├── _components/
│   │   ├── article-list-item.tsx     # Single article row (title, date, category)
│   │   └── article-list-loader.tsx   # Loading indicator + intersection observer sentinel
│   └── _view/
│       └── article-list-view.tsx     # Pure UI: renders list items + loader
│
└── [slug]/
    └── page.tsx                      # Placeholder article detail page
```

### Layer Separation

| Layer | File | Responsibility |
|-------|------|----------------|
| **Type** | `mock-articles.ts` | `Article` type definition + mock data |
| **Hook** | `use-article-list.ts` | Pagination state, `loadMore()`, `hasMore`, infinite scroll trigger |
| **View** | `article-list-view.tsx` | Pure presentational — receives articles array + loading state as props |
| **Components** | `article-list-item.tsx` | Single article row rendering |
| **Components** | `article-list-loader.tsx` | Intersection Observer sentinel + loading spinner |
| **Page** | `page.tsx` | Wires hook to view, composes with DashboardView |

### Data Flow

```
page.tsx
  └── useArticleList(mockArticles)
        ├── articles: Article[]       (current visible slice)
        ├── isLoading: boolean        (fetching next page)
        ├── hasMore: boolean          (more pages available)
        └── loadMore: () => void      (triggered by intersection observer)

  └── <DashboardView />
  └── <ArticleListView
        articles={articles}
        isLoading={isLoading}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
        └── {articles.map(a => <ArticleListItem />)}
        └── <ArticleListLoader />     (intersection observer sentinel)
```

## Technical Considerations

### Mock Data (`mock-articles.ts`)

```typescript
export type Article = {
  slug: string;
  title: string;
  cover_image: string;
  created_at: string;    // ISO date
  published_at: string;  // ISO date
  category: string;
  body: string;
};

export const MOCK_ARTICLES: Article[] = [/* 30 articles */];
```

- 30 articles with realistic titles, categories, and body content
- Categories: Music Production, Creativity, Meditation, Philosophy, Collaboration (thematically aligned with Rick Rubin)
- Dates spanning the last 2 years, sorted newest-first by `published_at`
- Slugs derived from titles (kebab-case)
- Body content: 2-3 paragraphs of realistic prose per article

### Infinite Scroll Hook (`use-article-list.ts`)

```typescript
export function useArticleList(allArticles: Article[], pageSize = 10) {
  // Returns: { articles, isLoading, hasMore, loadMore }
}
```

- Uses `useState` for current page index
- Slices `allArticles` array by page — no simulated network delay needed (mock data)
- `loadMore` appends next `pageSize` items
- `hasMore` is `false` when all 30 articles are loaded

### Intersection Observer (`article-list-loader.tsx`)

- Renders a sentinel `<div>` at the bottom of the list
- Uses `IntersectionObserver` to detect when sentinel enters viewport
- Calls `onLoadMore` when visible and `hasMore` is true
- Shows a loading spinner while `isLoading` is true
- Shows nothing when `!hasMore` (end of list)

### Article Detail Route (`[slug]/page.tsx`)

- Simple placeholder page showing "Article: {slug}"
- No real content rendering needed yet
- Uses `useParams()` to get slug from URL

### Article List Item (`article-list-item.tsx`)

- Displays: title, published_at (absolute format: "Feb 8, 2025"), category
- Wraps in `<Link>` to `/dashboard/articles/{slug}`
- Minimal styling — clean list layout

## Acceptance Criteria

- [ ] `Article` type defined with all 6 properties (title, cover_image, created_at, published_at, category, body)
- [ ] 30 mock articles with realistic content themed around Rick Rubin's interests
- [ ] Article list renders below DashboardView on the dashboard page
- [ ] Only 10 articles visible on initial load
- [ ] Scrolling to bottom loads next 10 articles automatically
- [ ] After 30 articles loaded, no more loading triggers
- [ ] Each article item shows title, published_at (absolute: "Feb 8, 2025"), and category
- [ ] Clicking an article navigates to `/dashboard/articles/[slug]`
- [ ] Placeholder detail page exists at `[slug]/page.tsx`
- [ ] Clear separation: hook (state/logic), view (UI), components (reusable pieces)
- [ ] `pnpm build --filter=@feel-good/mirror` passes

## Dependencies & Risks

**Dependencies:**
- None — mock data, no backend integration

**Risks:**
- Intersection Observer cleanup on unmount — ensure `disconnect()` in effect cleanup
- Scroll position persistence if user navigates to article and returns — out of scope for this prototype

## References

- Current dashboard: `apps/mirror/app/(protected)/dashboard/_view/dashboard-view.tsx`
- Dashboard page: `apps/mirror/app/(protected)/dashboard/page.tsx`
- Auth layer pattern (Block/Form/View/Hook): `packages/features/CLAUDE.md`
- Architecture doc: `docs/brainstorms/2026-02-03-auth-package-architecture-brainstorm.md`
