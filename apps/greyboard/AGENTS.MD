# CLAUDE.md

## Application Overview

AI-powered document creation & task management application.

### Core Features

- **Task System**: Full-featured Kanban board with project management, sub-tasks, and time tracking

## Commands

### Development

```bash
pnpm dev        # Start development server with Turbopack (http://localhost:3000)
pnpm build      # Build production application
pnpm start      # Run production server
pnpm lint       # Run ESLint - MUST pass before commits
```

### Data Persistence

Greyboard web is anonymous and local-only at runtime. Task and project data are persisted in browser `localStorage`.

## Code Philosophy

**Optimize for clarity.** We value craft and maintain a high signal-to-noise ratio in our codebase. This means:

- Prefer self-documenting code over clever code
- Use options objects over positional parameters when meaning isn't obvious
- Continuously refactor to improve readability
- Name things precisely - function names should reflect their full behavior
- Keep APIs simple and intuitive at call sites

When in doubt, ask: "Will this be clear to someone reading it for the first time?"

## Architecture

### Tech Stack

- **Next.js 15.4.10** with App Router and Turbopack
- **React 19** with strict TypeScript
- **Browser localStorage** for runtime task/project persistence
- **Tailwind CSS 4** with CSS variables design system
- **shadcn/ui** components (New York style) with Radix UI
- **@dnd-kit** for drag-and-drop task management
- **React Hook Form + Zod** for forms and validation
- **Zustand** for global state management (timer/stopwatch)
- **Framer Motion** for animations (insights page)
- **Recharts** for data visualization (analytics charts)

### Project Structure

```
app/
   (auth)/           # Legacy auth URLs (redirect to /dashboard/tasks)
   (protected)/      # Dashboard routes (no auth gating)
      dashboard/
          files/    # Document upload and management
          tasks/    # Task board with Kanban functionality
   insights/         # Analytics dashboard
   _actions/         # Server actions for data mutations

components/
   ui/               # shadcn/ui components (pre-installed)
   files/            # File management components
   tasks/            # Task board and ticket components
      sub-tasks/     # Sub-task inline editing components
      project-select/# Project selection and CRUD dialogs
   header/           # Header components
   layout/           # Layout components
   navigation/       # Navigation components
   providers/        # React context providers

config/              # Centralized configuration files
   paths.config.ts   # Route path constants
   board.config.ts   # Board columns, statuses, defaults
   tasks.config.ts   # Task-related constants
   navs.config.ts    # Navigation menu items
   insight-variants.ts # Insight card variants

hooks/               # Custom React hooks (18+)
   use-local-storage.ts      # SSR-safe localStorage with sync
   use-projects.ts           # Project CRUD operations
   use-ticket-form.ts        # Task form state management
   use-dialog-auto-save.ts   # Auto-save form drafts
   use-focus-management.ts   # Dialog focus handling
   __tests__/                # Hook tests

lib/
   services/         # Business logic
   schema/           # Zod validation schemas
   board-storage.ts  # Board persistence utilities
   insights-utils.ts # Analytics utilities
   storage-keys.ts   # Centralized localStorage keys
   storage.ts        # Storage utilities
   timer-utils.ts    # Timer/stopwatch utilities
   utils.ts          # General utilities

store/               # Zustand state management
   stop-watch-store.ts # Timer/stopwatch global state

styles/              # CSS variable definitions
   primitives.css    # Base design tokens
   components.css    # Component-specific styles
   globals.css       # Global styles
   background-colors.css
   text-colors.css
   icon-colors.css
   shadows.css

supabase/            # Optional SQL artifacts kept for reference only (not runtime)
   migrations/       # Database migrations
   schema/           # Database schema definitions

types/               # TypeScript type definitions
   board.types.ts    # Task/ticket types

docs/                # Project documentation
```

### State Management Strategy

The application uses different state management approaches based on use case:

- **React useState/useReducer**: Component-local state
- **localStorage** (via useLocalStorage hook):
  - UI preferences (theme, layout)
  - Board state persistence
  - Projects data
  - Cross-tab synchronization included
- **Zustand** (store/):
  - Timer/stopwatch global state
  - Shared state across components
- **React Context** (providers/):
  - Theme provider
- **No runtime backend auth/database**:
  - Application access is anonymous
  - Runtime data is stored locally in browser localStorage

## Key Features & Implementation

### Tasks Module (`/dashboard/tasks`)

Fully functional Kanban board with comprehensive task management features.

**Core Components:**

- `Board` - Main drag-and-drop board using @dnd-kit
- `BoardColumn` - Column containers with drop zones
- `TicketCard` - Draggable task cards with sub-tasks and timers
- `TicketFormDialog` - Create/edit modal with auto-save

**Features:**

- ✅ Drag-and-drop between 4 columns (Backlog, To Do, In Progress, Complete)
- ✅ Project system with color-coded categories
- ✅ Sub-tasks with inline editing
- ✅ Timer/stopwatch for in-progress tasks
- ✅ Time tracking and completion timestamps
- ✅ localStorage persistence with versioning
- ✅ Import/export board state (JSON)
- ✅ Auto-save for form drafts
- ✅ Keyboard shortcuts (Cmd/Ctrl+Enter to submit)
- ✅ Focus management in dialogs

**Persistence:**
Tasks persist to browser localStorage only (no Supabase integration currently).

**Key Hooks:**

- `useTicketForm` - Form state management
- `useProjects` - Project CRUD operations
- `usePersistedSubTasks` - Sub-task draft persistence
- `useDialogAutoSave` - Auto-save form changes

### Insights & Analytics (`/insights`)

Analytics dashboard for task completion tracking and time analysis.

**Features:**

- Focus timeline visualization with Recharts
- Task completion statistics
- Project breakdown analysis
- Animated UI with Framer Motion
- Intersection observer for drawer triggers

**Components:**

- `insight-card.tsx` - Card container for metrics
- `insights-header.tsx` - Page header with navigation
- `ring-percentage.tsx` - Circular progress indicators
- `insight-components.tsx` - Chart and visualization components

**Tech Stack:**

- Recharts for data visualization
- Framer Motion for enter/exit animations
- Tabs interface for different views

### Project Management

Color-coded project categorization system for tasks.

**Features:**

- Create, edit, delete projects
- 8 color options for visual categorization
- Project filtering in task board
- Persist via localStorage

**Components:**

- `ProjectSelect` - Dropdown selector in task forms
- `project-select/` directory with CRUD dialogs

**Hook:**

- `useProjects` - Full CRUD operations with localStorage persistence

### Configuration Pattern

Centralized configuration files in `/config` directory:

```typescript
config/
  paths.config.ts      # Route path constants
  board.config.ts      # Board columns, statuses, defaults
  tasks.config.ts      # Task-related constants
  navs.config.ts       # Navigation menu items
  insight-variants.ts  # Insight card variants
```

**Pattern:**

- Use `.config.ts` suffix for constant files
- Export typed constants
- Import via path alias: `@/config/*`

### Custom Hooks (`/hooks`)

18+ specialized React hooks for common patterns:

**Key Hooks:**

- `use-local-storage.ts` - SSR-safe localStorage with cross-tab sync
- `use-projects.ts` - Project CRUD operations
- `use-ticket-form.ts` - Task form state management
- `use-dialog-auto-save.ts` - Auto-save form drafts
- `use-focus-management.ts` - Dialog focus handling
- `use-keyboard-submit.ts` - Keyboard shortcut handling
- `use-persisted-sub-tasks.ts` - Sub-task draft persistence
- `use-stop-watch.ts` - Timer functionality
- `use-debounced-callback.ts` - Debounced function calls
- `use-keyboard-navigation.ts` - Keyboard navigation
- `use-project-filter.ts` - Project filtering logic
- `use-today-focus.ts` - Daily focus tracking

**Testing:**

- Test infrastructure with Jest + React Testing Library
- Example: `hooks/__tests__/use-project-filter.test.tsx`

## Development Patterns

### Component Development

```tsx
// Use shadcn/ui components from /components/ui
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils"; // Class merging utility

// Follow compound component patterns with data-slot
<Button data-slot='submit-button' className={cn("custom-class")} />;
```

### Form Handling

```tsx
// Always use React Hook Form + Zod
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1, "Required"),
});

type FormData = z.infer<typeof schema>;
```

### Global State with Zustand

```typescript
// Create a store in /store directory
import { create } from "zustand";

interface StopWatchStore {
  isRunning: boolean;
  start: () => void;
  stop: () => void;
}

export const useStopWatchStore = create<StopWatchStore>((set) => ({
  isRunning: false,
  start: () => set({ isRunning: true }),
  stop: () => set({ isRunning: false }),
}));

// Use in components
const { isRunning, start } = useStopWatchStore();
```

### Data Fetching

```tsx
// Use TanStack Query for data fetching
import { useQuery } from "@tanstack/react-query";
```

### Route Access

- No runtime auth middleware or session refresh
- `/`, `/sign-in`, `/sign-up`, and `/auth/callback` redirect to `/dashboard/tasks`
- Dashboard routes are accessible without authentication

## Code Quality Standards

### React/TypeScript Imports

- **Always use type imports** for TypeScript types to improve tree-shaking and clarity:

  ```typescript
  // ✅ DO
  import { useState, type KeyboardEvent } from "react";

  // ❌ DON'T
  import React from "react";
  // then use React.KeyboardEvent
  ```

### React Hooks Best Practices

- **Stable callback dependencies**: When creating hooks that accept callbacks in useEffect/useCallback/useMemo:

  - Document if the callback should be memoized by the caller
  - OR use `useCallback` with appropriate dependencies internally
  - OR use `useRef` to store the latest callback without triggering re-renders

  ```typescript
  // Example: Store callback in ref to avoid re-running effect
  const callbackRef = useRef(onSubmit);
  useEffect(() => {
    callbackRef.current = onSubmit;
  }, [onSubmit]);

  useEffect(() => {
    // Use callbackRef.current instead of onSubmit in dependency array
  }, [enabled]); // onSubmit not needed in deps
  ```

### Documentation Requirements

- **All custom hooks MUST have JSDoc comments** explaining:

  - Purpose and use case
  - Parameters and their types
  - Return values
  - Usage example (if not obvious)
  - Any caveats or important implementation details

  ```typescript
  /**
   * Manages focus behavior for form inputs in dialogs.
   *
   * Handles auto-focus on dialog open and navigation between fields.
   *
   * @returns Object containing refs and event handlers for form fields
   *
   * @example
   * const { handleAutoFocus, setRefs } = useFocusManagement();
   * <DialogContent onOpenAutoFocus={handleAutoFocus}>
   *   <Input ref={(el) => setRefs(el, field.ref)} />
   * </DialogContent>
   */
  export function useFocusManagement() { ... }
  ```

- **Utility functions and complex logic should have JSDoc comments**

### Pre-Implementation Checklist

Before marking a task as complete, verify:

1. ✅ All imports are correct and minimal
2. ✅ No missing type imports
3. ✅ React hooks follow best practices (dependency arrays, memoization)
4. ✅ Custom hooks have JSDoc documentation
5. ✅ TypeScript types are explicit (no implicit any)
6. ✅ Event handlers properly typed
7. ✅ Consider edge cases (e.g., cleanup in useEffect)

## Best Practices

### Core Development Principles

This project strictly adheres to two fundamental principles:

#### **YAGNI (You Aren't Gonna Need It)**

Build only what is explicitly requested or currently needed. Do not add features, infrastructure, or code for potential future use.

**DO:**

- Implement exactly what is requested
- Add features when they are being actively developed
- Keep code minimal and focused on current requirements
- Document how to extend the system when needed

**DON'T:**

- Add "just in case" functionality
- Create infrastructure for planned but unimplemented features
- Build abstractions before you have concrete use cases
- Add speculative configuration or options

#### **KISS (Keep It Simple, Stupid)**

Favor simple, straightforward solutions over clever or complex ones. Complexity should only be added when there's a clear, demonstrable need.

**DO:**

- Choose the simplest solution that works
- Use clear, descriptive names
- Write straightforward code that's easy to understand
- Refactor to add complexity only when requirements demand it

**DON'T:**

- Over-engineer solutions
- Add unnecessary abstractions
- Use complex patterns when simple ones suffice
- Optimize prematurely

**Example:**

```typescript
// ❌ DON'T - Over-engineered
class StorageManager<T> {
  constructor(
    private config: ComplexConfig,
    private middleware: Middleware[],
    private plugins: Plugin[]
  ) {}
  // ... 200 lines of unused functionality
}

// ✅ DO - Simple, direct
function getStorageKey(category: string, key: string): string {
  return `${PREFIX}.${category}.${key}`;
}
```

### Implementation Guidelines

1. **Always ask before adding infrastructure** - If tempted to create a "system" or "framework", stop and ask first
2. **Start minimal, grow organically** - Implement the bare minimum, add complexity only when needed
3. **Resist speculation** - Don't add code for "maybe later"
4. **Question your additions** - Ask: "Is this explicitly required right now?"

### localStorage Key Management

Reference implementation in `lib/storage-keys.ts`:

```typescript
const STORAGE_KEYS = {
  TASKS: {
    BOARD_STATE: "docgen.v1.tasks.board-state",
    PROJECTS: "docgen.v1.tasks.projects",
  },
  UI: {
    TODAY_FOCUS: "docgen.v1.ui.today-focus",
    THEME: "theme",
  },
};

// When implementing: add key to category, use getStorageKey(), don't add unused keys
```

## Common Patterns

### Path Aliases

```typescript
@/*  // Maps to project root
// Common imports:
@/components/ui/*
@/lib/utils
@/hooks/*
@/types/*
@/config/*
```

### Icon System

- Primary: Lucide React icons
- Custom: SVG icons in `/icons` directory
- Icon component: `@/components/ui/icon`

## Project Structure & Naming

### Per-Route Organization

- UI components: put under \_components/
- Client utilities: put under \_lib/
- Server-only utilities: put under \_lib/server/

### Naming Conventions

- Pages: page.tsx
- Loaders: {feature}-page.loader.ts
- Actions: {feature}-server-actions.ts
- Schemas: {feature}.schema.ts
- Constants: {feature}.config.ts
- Components: kebab-case.tsx

## Performance Considerations

- Turbopack for fast dev builds
- Standalone output for production
- React 19 with automatic batching
- Optimistic UI updates for drag-and-drop
- Image optimization via Next.js Image

## Security Notes

- All client-exposed env vars use `NEXT_PUBLIC_` prefix
- Server actions for data mutations
- Input validation with Zod schemas
- XSS protection via React's built-in escaping

# Respond format

- Always give me a commit message that I could copy and paste at the end of your response.
