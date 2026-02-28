---
name: Custom Hooks Pattern
category: Implementation
applies_to: [hooks, custom-hooks]
updated: 2026-01-14
documented_in: CLAUDE.md
---

# Custom Hooks Pattern

This document defines comprehensive conventions for creating, documenting, and testing custom React hooks in the codebase.

## Overview

Custom hooks encapsulate reusable logic that involves React features (state, effects, context, refs). They enable clean separation of concerns and prevent code duplication across components.

**When to create a custom hook:**
- Logic uses React hooks (useState, useEffect, useContext, etc.)
- Same pattern appears in 2+ components
- Complex stateful logic benefits from extraction
- Side effects need centralized management

**When NOT to create a custom hook:**
- Pure utility functions (no React hooks) → Use `/lib/utils.ts`
- Single-use logic → Keep inline in component
- Simple conditional rendering → Keep in component

---

## Naming Conventions

### File Naming

**Pattern:** `use-{feature}-{capability}.ts`

```
✅ CORRECT:
hooks/use-local-storage.ts
hooks/use-keyboard-submit.ts
hooks/use-persisted-sub-tasks.ts
hooks/use-dialog-auto-save.ts

❌ WRONG:
hooks/useLocalStorage.ts          (use kebab-case)
hooks/localStorage.ts              (missing "use-" prefix)
hooks/local-storage-hook.ts        (don't suffix with "-hook")
hooks/storage/use-local-storage.ts (no subdirectories)
```

### Function Naming

**Pattern:** `export function use[Feature][Capability]()`

```typescript
// ✅ CORRECT: PascalCase, matches file name
export function useLocalStorage<T>() { ... }
export function useKeyboardSubmit() { ... }

// ❌ WRONG:
export function localStorage() { ... }        // Missing "use" prefix
export function use_local_storage() { ... }   // snake_case
export default function useLocalStorage() { ... } // No default exports
```

### File Extensions

**Rule:** Hooks MUST use `.ts` extension (NOT `.tsx`)

```
✅ CORRECT:
use-projects.ts
use-keyboard-submit.ts

❌ WRONG:
use-theme-toggle.tsx   // .tsx is for components only
use-mobile.tsx         // .tsx is for JSX, hooks don't need it
```

**Why:** `.tsx` is for files containing JSX. Hooks are functions, not components.

---

## Return Types

### Decision Matrix

| Returns | Pattern | Example |
|---------|---------|---------|
| 1-2 values (like useState) | Tuple | `[value, setter]` |
| 3+ operations/values | Object | `{ state, action1, action2 }` |
| Complex API with methods | Object | `{ data, actions: { add, update } }` |

### Tuple Returns (Simple Hooks)

**Use when:** Hook returns 2-3 related values, similar to useState API

```typescript
// ✅ GOOD: Tuple for simple state + setter pattern
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  const setValue = (value: T) => { /* ... */ };
  const clearValue = () => { /* ... */ };

  return [storedValue, setValue, clearValue];
}

// Usage: Destructure like useState
const [projects, setProjects, clearProjects] = useLocalStorage("key", []);
```

### Object Returns (Complex Hooks)

**Use when:** Hook has 3+ operations, methods, or values

```typescript
// ✅ GOOD: Object for multiple operations
interface UseProjectsReturn {
  projects: Project[];
  addProject: (name: string, color: ProjectColor) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
}

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useLocalStorage<Project[]>(
    getStorageKey("TASKS", "PROJECTS"),
    []
  );

  const addProject = useCallback((name: string, color: ProjectColor) => {
    // ... implementation
  }, [setProjects]);

  return { projects, addProject, updateProject, deleteProject, getProjectById };
}

// Usage: Named destructuring, better IntelliSense
const { projects, addProject, deleteProject } = useProjects();
```

**Why objects are preferred for complex hooks:**
- Better discoverability (IDE autocomplete shows all methods)
- Easier to extend without breaking existing code
- Can destructure only what you need
- Self-documenting API

---

## Documentation Requirements

### MANDATORY: All Custom Hooks MUST Have JSDoc

**Template:**
```typescript
/**
 * [Single line: Purpose and primary use case]
 *
 * [Optional: Additional context, behavior, or important notes]
 *
 * @param paramName - Description of parameter
 * @param anotherParam - Description with constraints or examples
 *
 * @returns Description of return value structure
 *
 * @example
 * const { state, action } = useHook({
 *   enabled: true,
 *   onSubmit: handleSubmit,
 * });
 */
export function useHook(params: HookParams): HookReturn {
  // Implementation
}
```

### Real Examples from Codebase

#### Example 1: Simple Hook
```typescript
/**
 * Enables keyboard shortcut (Cmd/Ctrl+Enter) to submit forms.
 *
 * Useful for modal dialogs and forms where users expect quick submission.
 *
 * @param enabled - Whether the keyboard listener should be active
 * @param onSubmit - Callback to invoke when shortcut is pressed
 *
 * @example
 * useKeyboardSubmit({
 *   enabled: dialogOpen,
 *   onSubmit: () => form.handleSubmit(handleSubmit)(),
 * });
 */
export function useKeyboardSubmit({
  enabled,
  onSubmit,
}: UseKeyboardSubmitProps): void { ... }
```

#### Example 2: Complex Hook with Modes
```typescript
/**
 * Persists sub-task drafts to localStorage for ticket forms.
 *
 * Behavior varies by mode:
 * - CREATE mode: Loads persisted draft on open, auto-saves changes
 * - EDIT mode: No-op, uses ticket's existing data
 *
 * Call clearSubTasks() after successful submission to clean up drafts.
 *
 * @param ticketId - Current ticket ID (undefined for CREATE mode)
 * @param form - React Hook Form instance
 * @param dialogOpen - Whether dialog is currently open
 *
 * @returns Object with clearSubTasks method for manual cleanup
 *
 * @example
 * const { clearSubTasks } = usePersistedSubTasks({
 *   ticketId: editingTicket?.id,
 *   form,
 *   dialogOpen: isFormOpen,
 * });
 */
export function usePersistedSubTasks(params: Params): Return { ... }
```

### Documentation Checklist

- [ ] JSDoc comment exists above function
- [ ] First line describes purpose concisely
- [ ] All parameters documented with `@param`
- [ ] Return value documented with `@returns`
- [ ] Usage example provided with `@example`
- [ ] Important caveats or behavior noted (modes, side effects, cleanup)

---

## Dependency Arrays

### Problem: Callback Functions in Dependencies

**Issue:** Adding callbacks to dependency arrays can cause infinite re-renders

```typescript
// ❌ WRONG: Causes re-render loop
export function useKeyboardSubmit({ enabled, onSubmit }: Props) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      onSubmit(); // Uses onSubmit
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onSubmit]); // onSubmit changes every render → loop!
}
```

### Solution 1: useRef Pattern (RECOMMENDED)

**Use when:** Callback should always use latest version without re-running effect

```typescript
// ✅ CORRECT: useRef stores latest callback
export function useKeyboardSubmit({ enabled, onSubmit }: Props) {
  // Store callback in ref
  const onSubmitRef = useRef(onSubmit);

  // Update ref when callback changes
  useEffect(() => {
    onSubmitRef.current = onSubmit;
  }, [onSubmit]);

  // Use ref in effect (doesn't need to be in deps)
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      onSubmitRef.current(); // Always calls latest callback
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled]); // onSubmit NOT in deps, no re-render loop
}
```

**Why this works:**
- `useRef` doesn't cause re-renders when updated
- Effect runs only when `enabled` changes
- Latest callback is always available via `.current`

### Solution 2: useCallback Pattern

**Use when:** You need to memoize the callback AND pass it to child components

```typescript
// ✅ CORRECT: useCallback with proper dependencies
export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useLocalStorage<Project[]>(...);

  // Memoize callback with stable dependencies
  const addProject = useCallback(
    (name: string, color: ProjectColor): Project => {
      const newProject: Project = { /* ... */ };
      setProjects((prev) => [...prev, newProject]);
      return newProject;
    },
    [setProjects] // setProjects is stable from useLocalStorage
  );

  return { projects, addProject };
}
```

**When to use useCallback:**
- Callback is passed as prop to child components
- Child component uses `React.memo`
- You need referential equality

**When NOT to use useCallback:**
- Callback only used internally in effect → use `useRef` instead
- No child components depend on it → overhead not needed

---

## SSR Safety

### Problem: Server-Side Rendering

**Issue:** Browser APIs (window, document, localStorage) don't exist during SSR

### Solution: typeof window Checks

```typescript
// ✅ CORRECT: Check for window before using browser APIs
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    // Only run on client
    if (typeof window === "undefined") return;

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error("Error reading localStorage:", error);
    }
  }, [key]);

  return [storedValue, setStoredValue];
}
```

### Alternative: "use client" Directive

```typescript
// ✅ CORRECT: Mark entire file as client-only
"use client";

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Safe to use window here (file is client-only)
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}
```

**When to use "use client":**
- Hook exclusively uses browser APIs
- Always used in client components
- No SSR benefit from running on server

---

## Testing Requirements

### What to Test

**MUST test (required):**
- ✅ Hooks with side effects (useEffect)
- ✅ Hooks with complex logic (filters, calculations)
- ✅ Hooks with localStorage/external dependencies
- ✅ Hooks with cross-tab synchronization

**Optional testing:**
- Simple wrappers around useState
- Hooks with only state management (no side effects)
- Hooks with trivial logic

### Testing Pattern

**Setup:**
```typescript
import { renderHook, act } from "@testing-library/react";
import { useProjectFilter } from "../use-project-filter";

describe("useProjectFilter", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it("should initialize with empty selectedProjectIds", () => {
    const { result } = renderHook(() => useProjectFilter());

    expect(result.current.selectedProjectIds).toEqual([]);
  });

  it("should toggle a project on", () => {
    const { result } = renderHook(() => useProjectFilter());

    act(() => {
      result.current.toggleProject("project-1");
    });

    expect(result.current.selectedProjectIds).toEqual(["project-1"]);
  });

  it("should toggle a project off when clicked again", () => {
    const { result } = renderHook(() => useProjectFilter());

    act(() => {
      result.current.toggleProject("project-1");
      result.current.toggleProject("project-1");
    });

    expect(result.current.selectedProjectIds).toEqual([]);
  });
});
```

### Testing localStorage Hooks

```typescript
it("should persist to localStorage", () => {
  const { result } = renderHook(() => useProjectFilter());

  act(() => {
    result.current.toggleProject("project-1");
  });

  // Check localStorage was updated
  const stored = localStorage.getItem(
    getStorageKey("TASKS", "PROJECT_FILTER")
  );
  expect(JSON.parse(stored!)).toEqual(["project-1"]);
});
```

### Testing Cross-Tab Sync

```typescript
it("should synchronize across multiple hook instances", async () => {
  const { result: result1 } = renderHook(() => useProjectFilter());
  const { result: result2 } = renderHook(() => useProjectFilter());

  // Change in first instance
  act(() => {
    result1.current.toggleProject("project-1");
  });

  // Wait for sync event
  await act(async () => {
    await new Promise((resolve) => queueMicrotask(resolve));
  });

  // Second instance should update
  expect(result2.current.selectedProjectIds).toEqual(["project-1"]);
});
```

### Test File Location

```
hooks/
  __tests__/
    use-project-filter.test.tsx   ✅ Correct
    use-local-storage.test.tsx    ✅ Correct

  use-project-filter.test.tsx     ❌ Wrong (should be in __tests__)
```

---

## Common Patterns

### Pattern 1: localStorage with Cross-Tab Sync

**Use case:** State that persists across sessions and syncs across tabs

```typescript
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const item = window.localStorage.getItem(key);
      if (item) setStoredValue(JSON.parse(item));
    } catch (error) {
      console.error("Error loading from localStorage:", error);
    }
  }, [key]);

  // Save to localStorage when value changes
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));

        // Dispatch custom event for same-tab sync
        queueMicrotask(() => {
          window.dispatchEvent(
            new CustomEvent("local-storage-change", {
              detail: { key, newValue: valueToStore },
            })
          );
        });
      }
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  }, [key, storedValue]);

  // Listen for changes from other tabs + same tab
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      if ("key" in e && e.key !== key) return;

      const newValue = "detail" in e
        ? e.detail.newValue
        : e.newValue ? JSON.parse(e.newValue) : null;

      if (newValue !== null) setStoredValue(newValue);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("local-storage-change", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("local-storage-change", handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue] as const;
}
```

### Pattern 2: Ref-Based Callback Management

**Use case:** Event listeners that need latest callback without re-running effect

```typescript
export function useKeyboardNavigation({
  onArrowUp,
  onArrowDown,
  onEnter,
  enabled = true,
}: Props) {
  // Store callbacks in refs
  const onArrowUpRef = useRef(onArrowUp);
  const onArrowDownRef = useRef(onArrowDown);
  const onEnterRef = useRef(onEnter);

  // Update refs when callbacks change
  useEffect(() => {
    onArrowUpRef.current = onArrowUp;
    onArrowDownRef.current = onArrowDown;
    onEnterRef.current = onEnter;
  }, [onArrowUp, onArrowDown, onEnter]);

  // Effect only depends on enabled, not callbacks
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        onArrowUpRef.current();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        onArrowDownRef.current();
      } else if (e.key === "Enter") {
        e.preventDefault();
        onEnterRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled]); // Callbacks NOT in deps
}
```

### Pattern 3: Cleanup and Resource Management

**Use case:** Timers, intervals, subscriptions that need cleanup

```typescript
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): T & { cancel: () => void } {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedFn = useCallback(
    ((...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    }) as T,
    [delay]
  );

  // Expose manual cancel
  debouncedFn.cancel = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  return debouncedFn;
}
```

### Pattern 4: Hydration Control

**Use case:** Effects that should run only once on mount

```typescript
export function useTodayFocus(): [string, (value: string) => void] {
  const [focus, setFocus, clearFocus] = useLocalStorage<Record<string, string>>(
    getStorageKey("UI", "TODAY_FOCUS"),
    {}
  );

  const hasCleanedRef = useRef(false);

  // Cleanup old entries (only once on mount)
  useEffect(() => {
    if (hasCleanedRef.current) return;
    hasCleanedRef.current = true;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const updated = Object.fromEntries(
      Object.entries(focus).filter(([date]) => {
        const entryDate = new Date(date);
        return entryDate >= sevenDaysAgo;
      })
    );

    if (Object.keys(updated).length !== Object.keys(focus).length) {
      setFocus(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps with ref guard

  const todayKey = new Date().toISOString().split("T")[0];
  const todayFocus = focus[todayKey] || "";

  const setTodayFocus = (value: string) => {
    setFocus({ ...focus, [todayKey]: value });
  };

  return [todayFocus, setTodayFocus];
}
```

---

## Type Safety

### Generic Type Parameters

```typescript
// ✅ CORRECT: Generic for reusable hooks
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Type T flows through entire hook
}

// Usage: Type inference works
const [projects, setProjects] = useLocalStorage<Project[]>("key", []);
// projects is Project[]
// setProjects accepts Project[] or (prev: Project[]) => Project[]
```

### Parameter Interfaces

```typescript
// ✅ CORRECT: Named interface for parameters
interface UseKeyboardSubmitProps {
  enabled: boolean;
  onSubmit: () => void;
}

export function useKeyboardSubmit(props: UseKeyboardSubmitProps): void {
  const { enabled, onSubmit } = props;
  // ...
}
```

### Return Type Interfaces

```typescript
// ✅ CORRECT: Explicit return type interface
interface UseProjectsReturn {
  projects: Project[];
  addProject: (name: string, color: ProjectColor) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
}

export function useProjects(): UseProjectsReturn {
  // Implementation
}
```

**Export return interfaces:**
```typescript
// ✅ CORRECT: Export for use in other files
export interface UseProjectsReturn { ... }
export function useProjects(): UseProjectsReturn { ... }

// Consumer can reference return type
import { useProjects, type UseProjectsReturn } from "./use-projects";
```

---

## ESLint / TypeScript Rules

### Recommended ESLint Configuration

```json
{
  "rules": {
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "@typescript-eslint/no-explicit-any": "error"
  }
}
```

### File Extension Rule

**Manual enforcement:** Hooks must use `.ts`, not `.tsx`

```bash
# Find hooks with wrong extension
find hooks/ -name "*.tsx" -type f

# Should return nothing (or only test files)
```

### Dependency Array Linting

```typescript
// ⚠️ WARNING: eslint may flag this
useEffect(() => {
  callbackRef.current();
}, []); // onSubmit not in deps

// Solution: Add comment explaining why
useEffect(() => {
  callbackRef.current(); // Ref pattern, onSubmit stored in ref
}, []); // onSubmit intentionally excluded
```

---

## Anti-Patterns

### ❌ DON'T: Put Hooks in Components Folder

```typescript
// ❌ WRONG
components/tasks/use-task-logic.ts

// ✅ CORRECT
hooks/use-task-logic.ts
```

**Why:** Hooks should be centralized in `/hooks` for discoverability

### ❌ DON'T: Create Feature-Specific Hook Folders

```typescript
// ❌ WRONG
hooks/tasks/use-projects.ts
hooks/forms/use-ticket-form.ts

// ✅ CORRECT
hooks/use-projects.ts
hooks/use-ticket-form.ts
```

**Why:** Flat structure is easier to navigate and prevents over-organization

### ❌ DON'T: Use .tsx Extension for Hooks

```typescript
// ❌ WRONG
hooks/use-theme-toggle.tsx

// ✅ CORRECT
hooks/use-theme-toggle.ts
```

**Why:** `.tsx` is for JSX, hooks are functions

### ❌ DON'T: Skip Documentation on Complex Hooks

```typescript
// ❌ WRONG: No JSDoc
export function usePersistedSubTasks({ ticketId, form, dialogOpen }) {
  // 50 lines of complex logic
}

// ✅ CORRECT: Full JSDoc with example
/**
 * Persists sub-task drafts to localStorage for ticket forms.
 * ...
 */
export function usePersistedSubTasks(...) { ... }
```

### ❌ DON'T: Return Inconsistent Types

```typescript
// ❌ WRONG: Sometimes tuple, sometimes object
export function useHook(mode: string) {
  if (mode === "simple") {
    return [value, setValue];
  } else {
    return { value, setValue, reset };
  }
}

// ✅ CORRECT: Consistent return type
export function useHook(mode: string) {
  return { value, setValue, reset, mode };
}
```

---

## AI Agent Checklist

When creating or modifying a custom hook, follow this checklist:

### Before Writing Code

- [ ] Determine if logic should be a hook (uses React hooks? reusable?)
- [ ] Check if similar hook already exists in `/hooks`
- [ ] Decide on return type (tuple for 1-2 values, object for 3+)
- [ ] Plan parameter interface (what inputs does hook need?)

### File Setup

- [ ] Create file: `hooks/use-{feature}-{capability}.ts` (NOT .tsx)
- [ ] Add JSDoc comment at top with purpose, params, returns, example
- [ ] Import React hooks with type imports: `import { useState, type Dispatch } from "react"`
- [ ] Define parameter interface: `interface Use{Hook}Props { ... }`
- [ ] Define return interface (if returning object): `interface Use{Hook}Return { ... }`

### Implementation

- [ ] Add SSR safety checks (`typeof window === "undefined"`) if using browser APIs
- [ ] Use `useRef` pattern for callbacks in dependencies
- [ ] Add cleanup in `useEffect` return (remove listeners, clear timers)
- [ ] Use `useCallback` for methods in return object
- [ ] Handle errors gracefully (try/catch for localStorage, etc.)

### Testing (if hook has side effects)

- [ ] Create test file: `hooks/__tests__/use-{hook}.test.tsx`
- [ ] Test initialization with default values
- [ ] Test state updates with `act()`
- [ ] Test side effects (localStorage, event listeners)
- [ ] Test cross-tab sync (if applicable)
- [ ] Test cleanup (unmount behavior)

### Documentation

- [ ] JSDoc includes purpose, params, returns, example
- [ ] Complex behavior documented (modes, caveats, cleanup)
- [ ] Type parameters explained (if generic)
- [ ] Reference from CLAUDE.md if it's a foundational pattern

### Pre-Commit

- [ ] Hook file uses `.ts` extension (not `.tsx`)
- [ ] All parameters and return values are typed
- [ ] No `any` types
- [ ] ESLint passes (no exhaustive-deps warnings without explanation)
- [ ] Tests pass (if tests exist)

---

## Reference Examples

### Foundation Patterns (Study These)

1. **`use-local-storage.ts`** - Cross-tab sync, SSR safety, error handling
2. **`use-project-filter.test.tsx`** - Comprehensive testing example
3. **`use-keyboard-submit.ts`** - Ref-based callback pattern
4. **`use-persisted-sub-tasks.ts`** - Complex hook with modes
5. **`use-focus-management.ts`** - Multiple refs, keyboard navigation
6. **`use-projects.ts`** - Object return, CRUD operations

### Quick Reference Table

| Hook | Pattern | Key Feature |
|------|---------|-------------|
| `use-local-storage` | localStorage | Cross-tab sync, SSR safety |
| `use-keyboard-submit` | Event listener | Ref-based callbacks |
| `use-debounced-callback` | Timeout | Cleanup, manual cancel |
| `use-projects` | CRUD | Object return, validation |
| `use-project-filter` | Filter state | Testing example |
| `use-today-focus` | Date-keyed | Hydration control |

---

## Summary

**Key Takeaways:**
1. ✅ **Naming:** `use-{feature}-{capability}.ts` (kebab-case, .ts extension)
2. ✅ **Documentation:** MANDATORY JSDoc with purpose, params, returns, example
3. ✅ **Return Types:** Tuples for simple (1-2 values), objects for complex (3+)
4. ✅ **Dependencies:** Use `useRef` for callbacks to avoid re-render loops
5. ✅ **Testing:** Hooks with side effects MUST have tests
6. ✅ **SSR Safety:** Check `typeof window === "undefined"` or use `"use client"`
7. ✅ **Type Safety:** Define parameter and return interfaces, use generics
8. ✅ **Cleanup:** Always return cleanup function from useEffect

**This convention ensures:**
- Consistent, discoverable hook APIs
- Proper documentation for IDE support
- Testable, maintainable code
- SSR-safe implementations
- Type-safe usage across the codebase
