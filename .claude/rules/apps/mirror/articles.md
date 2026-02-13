---
paths:
  - "apps/mirror/features/articles/**"
---

# Mirror Articles Feature Rules

## Workspace Context Architecture

The articles feature uses a layered context pattern split by concern:

- `ArticleWorkspaceProvider` — root provider that composes all three contexts
- `ArticleToolbarContext` — owner state, sort, search, filter, categories, selected count, delete
- `ArticleListContext` — articles, pagination, username, selection, animation, empty state
- `ScrollRootContext` — scroll container ref for virtualized list

Consumers import from focused contexts to avoid cross-concern re-renders.

## Component Organization

```
features/articles/
  components/          # Interactive components with state
    filter/            # Filter submenu components (category, date, status)
  context/             # React contexts (workspace, toolbar, list, scroll-root)
  hooks/               # Feature hooks (filter, pagination, search, selection, sort)
  utils/               # Pure utilities (filter logic, config, date presets)
  views/               # Presentational components (detail, list, toolbar, dialog)
  lib/                 # Data layer (mock data, formatters)
  index.ts             # Public API
```

## Toolbar / Content Separation

- Toolbar components render into `WorkspaceToolbarSlot` via the workspace layout
- Content components render in the main content area
- Toolbar state flows through `ArticleToolbarContext`
- List state flows through `ArticleListContext`
- Never mix toolbar concerns into list components or vice versa

## Filter Pattern

Filters use `DropdownMenu` with `DropdownMenuSub` for nested categories:

- **Category**: multi-select with search input, selected badges, checkboxes
- **Date presets**: single-select (all, last 7 days, last 30 days, this year)
- **Published state**: single-select (all, published, draft) — owner only

Owner-only filters are gated by `isOwner` from `ArticleToolbarContext`.

## Hooks Convention

Each concern gets its own hook file:

| Hook | Responsibility |
|------|---------------|
| `use-article-filter` | Filter state and derived `hasActiveFilters` |
| `use-article-pagination` | Load-more pagination with `hasMore` |
| `use-article-search` | Debounced search input state |
| `use-article-selection` | Multi-select with select-all/indeterminate |
| `use-article-sort` | Sort order state |
