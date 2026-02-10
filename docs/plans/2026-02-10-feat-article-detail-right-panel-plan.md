---
title: "feat: Article Detail in Right Panel with View Transitions"
type: feat
date: 2026-02-10
app: mirror
---

# feat: Article Detail in Right Panel with View Transitions

## Overview

Keep the dashboard shell (profile panel + resizable panels) persistent across both `/dashboard` and `/dashboard/articles/[slug]` routes. Article detail content renders inside the right panel where the article list lives, with smooth View Transitions between the two views. A back button appears in the header when viewing article detail.

## Problem Statement / Motivation

Currently, clicking an article in the dashboard navigates to a standalone placeholder page at `/dashboard/articles/[slug]`, leaving the dashboard layout behind entirely. The profile panel, resizable panels, and header all disappear. The goal is to maintain layout continuity — the profile stays visible, the panel sizes persist, and the right panel smoothly transitions between article list and article detail.

## Proposed Solution

### Approach: Layout-Level Panel Shell + React View Transitions

Move the ResizablePanelGroup from `dashboard-view.tsx` (page-level) into `layout.tsx` (layout-level) via a new `DashboardShell` client component. Both routes inherit the same shell. The right panel renders `{children}` wrapped in `<ViewTransition>` from React.

### File Structure

```
apps/mirror/
├── next.config.ts                                          # Enable experimental.viewTransition
├── styles/globals.css                                      # Add view transition CSS
├── app/(protected)/dashboard/
│   ├── layout.tsx                                          # Render DashboardShell around children
│   ├── page.tsx                                            # Just <ScrollableArticleList>
│   ├── _components/
│   │   ├── dashboard-shell.tsx                             # NEW — shared panel layout shell
│   │   ├── dashboard-header.tsx                            # Add conditional back button
│   │   └── dashboard-view.tsx                              # DELETE — replaced by shell
│   └── articles/[slug]/
│       └── page.tsx                                        # Render ArticleDetailView
├── features/articles/
│   ├── context/
│   │   └── scroll-root-context.tsx                         # NEW — mobile scroll root context
│   ├── views/
│   │   ├── article-list-view.tsx                           # Unchanged
│   │   └── article-detail-view.tsx                         # NEW — article content display
│   ├── components/
│   │   └── scrollable-article-list.tsx                     # Switch scrollRoot prop → context
│   ├── lib/
│   │   └── mock-articles.ts                                # Add findArticleBySlug
│   └── index.ts                                            # Add new exports
```

### File Changes

#### 1. Enable View Transitions — `apps/mirror/next.config.ts`

Add `experimental.viewTransition: true` to the Next.js config. Required for `<ViewTransition>` from React to integrate with Next.js navigation.

#### 2. Create `DashboardShell` — `dashboard/_components/dashboard-shell.tsx`

Extract from `dashboard-view.tsx`. Client component that:
- Accepts `profile: Profile` and `children: React.ReactNode`
- Desktop: `ResizablePanelGroup` — left panel (ProfileInfoView), right panel (DashboardHeader + `<ViewTransition>{children}</ViewTransition>`)
- Mobile: `MobileProfileLayout` with `<ViewTransition>{children}</ViewTransition>` inside the drawer content
- Provides `ScrollRootProvider` in the mobile branch (from the `MobileProfileLayout` render-prop callback)

#### 3. Create `ScrollRootContext` — `features/articles/context/scroll-root-context.tsx`

Minimal context to bridge the mobile `scrollRoot` from the layout shell to the article list page:

```tsx
"use client";
import { createContext, useContext } from "react";
const ScrollRootContext = createContext<HTMLElement | null>(null);
export const ScrollRootProvider = ScrollRootContext.Provider;
export function useScrollRoot() { return useContext(ScrollRootContext); }
```

Needed because `scrollRoot` is set by `MobileProfileLayout` (in the shell) but consumed by `ScrollableArticleList` (in the page). Context bridges the Next.js layout/page boundary. The article detail page doesn't use it — `null` default is harmless.

#### 4. Update `ScrollableArticleList` — `features/articles/components/scrollable-article-list.tsx`

Remove `scrollRoot` prop, consume `useScrollRoot()` from context instead. Internal components (`ArticleListView`, `ArticleListLoader`) continue accepting `scrollRoot` as props — unchanged.

#### 5. Update `layout.tsx` — `dashboard/layout.tsx`

Render `DashboardShell` around `{children}`:

```tsx
import { DashboardShell } from "./_components/dashboard-shell";
import { MOCK_PROFILE } from "@/features/profile";

export default async function DashboardLayout({ children }) {
  const authed = await isAuthenticated();
  if (!authed) redirect("/sign-in");
  return <DashboardShell profile={MOCK_PROFILE}>{children}</DashboardShell>;
}
```

#### 6. Simplify `page.tsx` — `dashboard/page.tsx`

Only render the right-panel content:

```tsx
export default function DashboardPage() {
  return <ScrollableArticleList articles={MOCK_ARTICLES} />;
}
```

#### 7. Create `ArticleDetailView` — `features/articles/views/article-detail-view.tsx`

Pure presentational component. Renders article content: cover image, category, title, published date, body text. Reuses the `Article` type from `lib/mock-articles.ts`.

#### 8. Add `findArticleBySlug` — `features/articles/lib/mock-articles.ts`

```tsx
export function findArticleBySlug(slug: string): Article | undefined {
  return MOCK_ARTICLES.find((a) => a.slug === slug);
}
```

#### 9. Rewrite `articles/[slug]/page.tsx`

```tsx
import { notFound } from "next/navigation";
import { findArticleBySlug, ArticleDetailView } from "@/features/articles";

export default async function ArticlePage({ params }) {
  const { slug } = await params;
  const article = findArticleBySlug(slug);
  if (!article) notFound();
  return <ArticleDetailView article={article} />;
}
```

Renders inside the shell's right panel automatically via the shared layout.

#### 10. Update `DashboardHeader` — `dashboard/_components/dashboard-header.tsx`

Make it a client component. Use `usePathname()` to detect `/dashboard/articles/*`. Show a back button (`<Link href="/dashboard">`) on the left when on detail view. Keep `ThemeToggleButton` on the right.

#### 11. Add View Transition CSS — `styles/globals.css`

```css
::view-transition-old(dashboard-content) {
  animation: content-fade-out 150ms ease-out;
}
::view-transition-new(dashboard-content) {
  animation: content-fade-in 200ms ease-in;
}
@keyframes content-fade-out {
  to { opacity: 0; transform: translateY(-4px); }
}
@keyframes content-fade-in {
  from { opacity: 0; transform: translateY(8px); }
}
```

#### 12. Update feature exports — `features/articles/index.ts`

Add exports: `ArticleDetailView`, `findArticleBySlug`, `ScrollRootProvider`, `useScrollRoot`.

#### 13. Delete `dashboard-view.tsx`

Replaced by `dashboard-shell.tsx`.

### Implementation Order

1. `next.config.ts` — enable viewTransition flag
2. `features/articles/context/scroll-root-context.tsx` — create context
3. `features/articles/lib/mock-articles.ts` — add `findArticleBySlug`
4. `features/articles/views/article-detail-view.tsx` — create detail view
5. `features/articles/index.ts` — add new exports
6. `features/articles/components/scrollable-article-list.tsx` — switch to context
7. `dashboard/_components/dashboard-shell.tsx` — create shell with ViewTransition
8. `dashboard/_components/dashboard-header.tsx` — add back button
9. `dashboard/layout.tsx` — render shell
10. `dashboard/page.tsx` — simplify to article list only
11. `dashboard/articles/[slug]/page.tsx` — render detail view
12. `styles/globals.css` — add view transition CSS
13. Delete `dashboard-view.tsx`

## Key Design Decisions

- **ScrollRootContext**: Mobile drawer's scroll container is set by `MobileProfileLayout` in the shell but consumed by `ScrollableArticleList` in the page. React context bridges this layout/page boundary cleanly.
- **ViewTransition from React**: Next.js 16 + `experimental.viewTransition` enables `<ViewTransition>` imported from `react`. Wrapping the right panel children applies browser-native view transitions on navigation.
- **Back button via `usePathname()`**: Header uses URL as source of truth — no prop drilling or state management needed.
- **Layout-level shell**: Profile panel, resizable panels, and header persist across route changes. Video keeps playing, panel sizes preserved.

## Verification

1. `pnpm dev --filter=@feel-good/mirror` — start dev server
2. Navigate to `http://localhost:3001/dashboard`
3. Verify profile panel on left, article list on right
4. Click an article — verify:
   - URL changes to `/dashboard/articles/[slug]`
   - Profile panel persists (video keeps playing)
   - Right panel shows article detail with smooth fade transition
   - Back button appears in header
5. Click back — verify:
   - URL returns to `/dashboard`
   - Article list shown with smooth transition
   - Scroll position in list preserved
6. Test mobile viewport (< 768px):
   - Drawer shows article list, clicking navigates to detail in drawer
   - Infinite scroll still works (scroll root context)
7. Test invalid slug — `/dashboard/articles/nonexistent` returns 404
8. `pnpm build --filter=@feel-good/mirror` — verify production build passes
