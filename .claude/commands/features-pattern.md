# Features Pattern

This document outlines the features pattern for organizing shared functionality in the Delphi codebase.

## Overview

The `features/` directory contains **shared features** - functionality that is used across multiple pages or routes. This pattern provides:

- **Co-location**: Related code (components, hooks, types, utils) lives together
- **Clear boundaries**: Easy to understand what belongs to each feature
- **Scalability**: Features remain self-contained as they grow
- **Clean imports**: Semantic imports like `@/features/mind-widget`

## Internal Structure

Each feature follows a consistent folder structure:

```
features/
  <feature-name>/
    components/     # Feature-specific components
    hooks/          # Feature-specific hooks
    types/          # TypeScript types and interfaces
    utils/          # Helper functions
    index.ts        # Barrel export for clean imports
```

### Example: Mind Widget Feature

```
features/
  mind-widget/
    components/
      mind-widget.tsx
      mind-widget-small.tsx
      mind-progress-bar.tsx
    hooks/
      use-mind-score.ts
    types/
      index.ts
    utils/
      level-helpers.ts
    index.ts
```

## What Goes Where

| Location | Content | Example |
|----------|---------|---------|
| `features/` | Shared features used across multiple pages | mind-widget, mind-dialog |
| `app/<route>/_components/` | Page-specific components | analytics charts only used on that page |
| `components/ui/` | Generic UI primitives (shadcn) | Button, Card, Dialog |
| `components/layouts/` | Layout wrappers | DashboardLayout |
| `components/providers/` | Global context providers | ThemeProvider, RootProvider |
| `hooks/` | Generic hooks not tied to a feature | useLocalStorage, useThemeToggle |
| `lib/` | Utilities and services | utils.ts, api clients |

## Import Conventions

Use barrel exports via `index.ts` for clean imports:

```typescript
// index.ts - Barrel export
export { MindWidget } from "./components/mind-widget";
export { MindWidgetSmall } from "./components/mind-widget-small";
export { useMindScore } from "./hooks/use-mind-score";
export type { MindScoreState } from "./types";
```

```typescript
// Usage in other files
import { MindWidget, useMindScore } from "@/features/mind-widget";
```

## When to Create a Feature

Create a new feature folder when:

1. The functionality is used on **2+ different pages/routes**
2. The code has **multiple related files** (components, hooks, types)
3. The feature represents a **cohesive domain concept**

Do NOT create a feature folder for:

- Single-use components (keep in `app/<route>/_components/`)
- Generic utilities (keep in `lib/`)
- UI primitives (keep in `components/ui/`)

## Migration Checklist

When migrating existing code to a feature:

- [ ] Identify all related files (components, hooks, types, utils)
- [ ] Create the feature folder structure
- [ ] Move files to appropriate subfolders
- [ ] Create `index.ts` barrel export
- [ ] Update all import paths across the codebase
- [ ] Verify build passes (`pnpm build`)
- [ ] Test affected pages

## Naming Conventions

- **Feature folder**: kebab-case matching the feature name (`mind-widget`)
- **Components**: PascalCase (`MindWidget.tsx` or `mind-widget.tsx`)
- **Hooks**: camelCase with `use` prefix (`useMindScore.ts`)
- **Types**: PascalCase for types/interfaces (`MindScoreState`)
- **Utils**: camelCase (`formatLevel.ts`)
