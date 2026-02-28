---
title: "refactor: Assess article list against shadcn DataTable pattern"
type: refactor
date: 2026-02-19
---

# Assess Article List vs shadcn DataTable (TanStack Table)

## Overview

Compare the current hand-rolled article list implementation (`features/articles/`) against refactoring to shadcn UI's recommended DataTable pattern (built on `@tanstack/react-table`). The goal is to determine whether the migration adds value or introduces unnecessary indirection.

## Current Architecture

The article list is a **15-component, 5-hook, 3-context** feature with a deliberate separation-of-concerns architecture:

```
ArticleWorkspaceProvider (orchestrator)
├── ArticleToolbarContext  → toolbar UI (search, sort, filter, delete)
├── ArticleListContext     → list UI (articles, selection, pagination)
└── ScrollRootContext      → IntersectionObserver root
```

### Filtering Pipeline

```
initialArticles
  → useArticleSearch()       [debounced text search with relevance scoring]
  → filterArticles()         [multi-dimensional faceted filtering]
  → useArticlePagination()   [sort + infinite scroll pagination]
```

### Key Components

| File | Role |
|------|------|
| `article-workspace-context.tsx` | Composes 5 hooks, provides 2 memoized contexts |
| `article-list.tsx` | Pure presentational table (receives all props) |
| `article-list-item.tsx` | Memo'd row with link overlay, conditional checkbox |
| `animated-article-row.tsx` | framer-motion stagger animation on sort change |
| `article-list-loader.tsx` | IntersectionObserver sentinel for infinite scroll |
| `article-toolbar-connector.tsx` | Connector: reads toolbar context, passes props |
| `scrollable-article-list.tsx` | Container: reads list context + scroll root, passes props |

### State Storage

| Concern | Storage | Persistence |
|---------|---------|-------------|
| Filter (categories, date presets, status) | localStorage | Cross-session |
| Sort order | useState | Per-mount |
| Search query | useState (debounced) | Transient |
| Selection | useState (Set\<string\>) | Transient |
| Pagination page | useState | Resets on filter/search change |

---

## shadcn DataTable Pattern

shadcn's recommended pattern uses TanStack Table as a headless state engine:

```tsx
const table = useReactTable({
  data,
  columns,                           // declarative column definitions
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  state: { sorting, columnFilters, columnVisibility, rowSelection },
  onSortingChange: setSorting,
  onColumnFiltersChange: setColumnFilters,
  ...
});
```

The codebase already has a reference implementation at `apps/ui-factory/app/components/data-table/_components/data-table.tsx`. TanStack Table is installed in ui-factory and greyboard but **not** in mirror.

---

## Dimension-by-Dimension Comparison

### 1. Filtering Model (Critical Mismatch)

| Aspect | Current | TanStack Table |
|--------|---------|----------------|
| Model | Multi-dimensional faceted: categories[], date presets, status | Per-column: `{columnId, value}` pairs |
| Category filter | Array of selected category names (AND with other filters) | Would need custom `filterFn` on a "category" column |
| Date filter | Preset-based ranges (today, this_week, etc.) applied to `published_at` / `created_at` | No preset concept; would need custom filter function |
| Status filter | Owner-only `draft \| published \| null` toggle | Would need custom filter with owner-gating |
| Cross-filter logic | All dimensions AND together in `filterArticles()` | Each column filtered independently by default; custom global filter needed for AND logic |

**Verdict: Current wins.** The article list uses faceted filtering that doesn't map to TanStack's column-oriented model. To use TanStack filtering, you'd either:
- Pre-filter externally and pass filtered data to TanStack (defeating the purpose)
- Write custom `filterFn` per column + a global filter coordinator (adding complexity without reducing it)

### 2. Search (Current is More Capable)

| Aspect | Current | TanStack Table |
|--------|---------|----------------|
| Scope | Title + body plaintext + category | Per-column or global string match |
| Ranking | Relevance scoring: title (0) > body (1) > category (2) | No built-in ranking; results are unordered |
| Debounce | 300ms debounce with `debouncedQuery` | Must implement externally |
| Plaintext extraction | Pre-computed `getPlainText(article.body)` from Tiptap JSON | Would still need the same preprocessing |
| Result ordering | `preserveOrder` flag suppresses sort when search is active | No concept of "search overrides sort" |

**Verdict: Current wins.** TanStack's global filter is a simple string match. The relevance-scored, debounced search with Tiptap body extraction would remain as custom code regardless.

### 3. Pagination (Incompatible Model)

| Aspect | Current | TanStack Table |
|--------|---------|----------------|
| Model | Infinite scroll (IntersectionObserver, 30 items per load) | Page-based (Previous/Next buttons, fixed page size) |
| UX | Content streams in as user scrolls | User clicks to navigate pages |
| Scroll root | Configurable via `ScrollRootContext` (mobile drawer vs viewport) | No scroll awareness |
| Reset behavior | Auto-resets to page 1 on filter/search change | Manual `table.setPageIndex(0)` needed |

**Verdict: Current wins.** TanStack's `getPaginationRowModel()` does page-based slicing. The article list uses infinite scroll, which TanStack doesn't support. You'd keep the custom `useArticlePagination` hook and `ArticleListLoader` IntersectionObserver sentinel regardless.

### 4. Row Selection

| Aspect | Current | TanStack Table |
|--------|---------|----------------|
| State | `Set<string>` of selected slugs | `Record<string, boolean>` keyed by row index |
| Select all | Scoped to paginated (visible) articles | `toggleAllPageRowsSelected()` — similar |
| Auto-clear | On search open, filter change, sort change (via useEffect) | No auto-clear; must add custom side effects |
| Indeterminate | Computed from selection count vs total | `getIsSomePageRowsSelected()` — built-in |
| Delete flow | Reads from `selectedSlugsRef` (stale closure safety) | Would use `table.getFilteredSelectedRowModel().rows` |

**Verdict: Marginal TanStack advantage.** TanStack's selection API is slightly cleaner (`row.getIsSelected()`, `row.toggleSelected()`), but the auto-clear behavior — which is the complex part — would still require the same custom side effects.

### 5. Sorting

| Aspect | Current | TanStack Table |
|--------|---------|----------------|
| Options | newest / oldest (by `published_at`) | Multi-column, per-column, toggleable direction |
| Implementation | Simple comparator in `useArticlePagination` | `getSortedRowModel()` with column-level `toggleSorting()` |
| Animation trigger | `shouldAnimate = true` for 1000ms on sort change | No animation support; would still need framer-motion integration |
| Search override | `preserveOrder` flag skips sort during active search | Would need custom logic to suppress sorting |

**Verdict: Neutral.** Current sorting is trivially simple (2 options). TanStack adds multi-column sorting capability that isn't needed. The animation trigger and search-override behaviors would remain custom code.

### 6. Row Animation

| Aspect | Current | TanStack Table |
|--------|---------|----------------|
| Implementation | `AnimatedArticleRow` renders `motion.tr` or plain `tr` | No animation support |
| Trigger | `shouldAnimate` flag on sort change, 1000ms window | Would need same flag mechanism |
| Config | Staggered variants: `index * 0.01` delay, spring physics | Would need integration into `flexRender` loop |

**Verdict: Current wins.** TanStack's `flexRender` loop adds indirection for integrating `motion.tr`. The current pattern (`AnimatedArticleRow` wrapping `TableRow`) is more direct.

### 7. Owner-Conditional Columns

| Aspect | Current | TanStack Table |
|--------|---------|----------------|
| Checkbox column | `{isOwner && <TableHead>...}` inline JSX | Dynamic column array: `useMemo(() => isOwner ? [...cols, selectCol] : cols, [isOwner])` |
| Owner-only filters | Inline conditionals in filter dropdown | Same — toolbar is independent of table |

**Verdict: Current is simpler.** Conditional JSX is more readable than conditionally constructing column definition arrays.

### 8. Bundle Impact

| Aspect | Current | With TanStack |
|--------|---------|---------------|
| Additional dependency | None | `@tanstack/react-table` (~13KB gzipped) |
| Table primitives | Already using `@feel-good/ui/primitives/table` | Same primitives, plus `flexRender` |

**Verdict: Current wins marginally.** 13KB isn't large, but it's non-zero overhead for a feature that doesn't use TanStack's core value propositions.

---

## Where TanStack Table WOULD Help

TanStack Table becomes valuable when the article list evolves toward:

- **Column resizing / reordering / pinning** — built-in with `getResizeHandler()`, column ordering state
- **Per-column sorting UI** — click column headers to sort (vs the current dropdown)
- **Column visibility toggles** — hide/show columns via dropdown
- **Server-side operations** — `manualSorting`, `manualFiltering`, `manualPagination` flags let TanStack manage state while the server does the work
- **Virtualization** — TanStack Virtual integrates with TanStack Table for 10K+ row rendering
- **Data grid UX** — when the article list feels more like a spreadsheet than a content feed

None of these are current requirements or near-term needs.

---

## Recommendation: Keep Current Implementation

The article list is a **curated content list**, not a **data grid**. The key differentiators:

1. **Faceted filtering** (categories + date presets + status) doesn't map to TanStack's per-column model
2. **Relevance-scored search** with Tiptap body extraction is custom regardless
3. **Infinite scroll** is incompatible with TanStack's page-based pagination
4. **Row animation** requires framer-motion integration that TanStack doesn't simplify
5. **The current architecture is well-structured** — 3-context split prevents re-renders, connector pattern separates data from UI, hooks are focused and testable

Adopting TanStack Table would mean:
- Adding a dependency that manages sorting and selection (the easy parts)
- While keeping ALL the custom hooks for search, filter, and pagination (the hard parts)
- Plus writing adapter code to bridge TanStack state with the existing context architecture
- Net result: **more code, more indirection, no reduction in complexity**

### When to Revisit

Revisit this decision if:
- The article list needs **column-level** sorting/filtering (click header to sort)
- Server-side pagination/filtering is introduced (Convex replaces mock data)
- Column visibility toggles become a requirement
- The dataset grows large enough to need virtualization (1000+ articles)
- Multiple data table views are needed across mirror (reuse justifies the abstraction)

---

## References

- Current implementation: `apps/mirror/features/articles/`
- Reference DataTable: `apps/ui-factory/app/components/data-table/_components/`
- Architecture rules: `.claude/rules/apps/mirror/articles.md`
- UI primitives: `packages/ui/src/primitives/table.tsx`
