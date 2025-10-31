# Sub-Tasks Inline Editing Refactoring Plan

**Status**: Draft
**Created**: 2025-10-31
**Priority**: High
**Complexity**: Medium-High

---

## Table of Contents

1. [Problem Analysis](#problem-analysis)
2. [Current Architecture Issues](#current-architecture-issues)
3. [Solution Options](#solution-options)
4. [Recommended Approach](#recommended-approach)
5. [Implementation Plan](#implementation-plan)
6. [Testing Strategy](#testing-strategy)
7. [Rollback Plan](#rollback-plan)
8. [Success Criteria](#success-criteria)

---

## Problem Analysis

### The Bug

**Error**: "Maximum update depth exceeded" when toggling sub-task completion and opening the ticket form dialog.

### Root Cause: Infinite Loop Chain

```
1. User toggles checkbox in TicketCard
   ↓
2. form.watch() detects change in ticket-card.tsx:157
   ↓
3. useEffect calls onSubTasksChange() (ticket-card.tsx:159-171)
   ↓
4. Board updates state via handleUpdateSubTasks (board.tsx:284-326)
   ↓
5. Board re-renders, TicketCard receives new ticket prop
   ↓
6. useEffect runs because resetSubTaskForm in deps (ticket-card.tsx:130-147)
   ↓
7. Form reset triggers watch callback
   ↓
8. Back to step 3 → INFINITE LOOP
```

### Contributing Factors

1. **Unstable dependency** (`resetSubTaskForm` in useEffect deps)
2. **Unstable callback** (inline arrow function in board-column.tsx:156-158)
3. **Dual form management** (separate forms in TicketCard and Dialog)
4. **Watch/reset cycle** (watching changes while also resetting from props)

---

## Current Architecture Issues

### 1. Dual Form Management (Primary Issue)

Two separate React Hook Forms managing the same data:

```
ticket-card.tsx
  ↓ useForm() for inline sub-task editing
  ↓
Board State (localStorage: BOARD_STATE)
  ↓
ticket-form-dialog.tsx
  ↓ useForm() for full ticket editing
```

**Problem**: Both forms watch and reset based on external state changes, creating circular dependencies.

### 2. Multiple Sources of Truth

- Board state (localStorage: `BOARD_STATE`)
- TicketCard's local form state
- Dialog's local form state
- Persisted draft sub-tasks (localStorage: `TICKET_FORM_SUBTASKS`)

**Problem**: Synchronization complexity increases exponentially with each source.

### 3. Complex Data Flow

```
TicketCard form.watch()
  → onChange callback
  → Board state update
  → TicketCard re-render
  → form.reset()
  → watch() triggers
  → Loop
```

**Problem**: Tight coupling between view updates and state management.

### 4. Tight Coupling

The inline editing (view concern) is tightly coupled with form state management (edit concern).

**Problem**: Violates separation of concerns, makes testing difficult.

---

## Solution Options

### Option A: Separation of Concerns

**Principle**: Separate "view/display" from "edit" modes.

```
TicketCard (Display Only)
  ↓ Simple onClick handlers
  ↓
Board State (Single Source)
  ↓ Props
  ↓
TicketFormDialog (Edit Only)
  ↓ React Hook Form
```

**Pros**:
- ✅ Eliminates dual form management
- ✅ No watch/reset loops
- ✅ Simplest mental model
- ✅ Aligns with React best practices

**Cons**:
- ❌ Loses inline editing capability
- ❌ Less responsive feel for quick edits

**Verdict**: Too restrictive - user wants inline editing.

---

### Option B: Controlled Components (No Forms in Card)

Use controlled components instead of React Hook Form in TicketCard:

```tsx
// ticket-card.tsx - NO FORM
export function TicketCard({ ticket, onUpdateSubTasks }) {
  const handleToggle = (subTaskId: string) => {
    const updated = ticket.subTasks.map(st =>
      st.id === subTaskId ? { ...st, completed: !st.completed } : st
    );
    onUpdateSubTasks(ticket.id, updated);
  };

  return (
    <SubTasksList
      subTasks={ticket.subTasks}
      onToggle={handleToggle}
    />
  );
}
```

**Pros**:
- ✅ Direct state updates
- ✅ No form overhead
- ✅ Simple to understand
- ✅ Keeps inline editing

**Cons**:
- ❌ Loses form validation for sub-tasks
- ❌ Loses array helper utilities from React Hook Form
- ❌ May need custom drag-and-drop logic

**Verdict**: Good option, but loses some DX benefits.

---

### Option C: Dirty Flag Pattern ⭐ RECOMMENDED

**Principle**: Local state with dirty tracking prevents external updates during editing.

```tsx
export function TicketCard({ ticket, onUpdateSubTasks }) {
  const [localSubTasks, setLocalSubTasks] = useState(ticket.subTasks ?? []);
  const [isDirty, setIsDirty] = useState(false);

  // Immediate local update (optimistic)
  const handleChange = (updated: SubTask[]) => {
    setLocalSubTasks(updated);
    setIsDirty(true);
    debouncedSave(updated);
  };

  // Debounced sync to board
  const debouncedSave = useDebouncedCallback((data) => {
    onUpdateSubTasks(data);
    setIsDirty(false);
  }, 500);

  // Only accept external updates when clean
  useEffect(() => {
    if (!isDirty) {
      setLocalSubTasks(ticket.subTasks ?? []);
    }
  }, [ticket.subTasks, isDirty]);

  return (
    <SubTasksList
      subTasks={localSubTasks}
      onChange={handleChange}
    />
  );
}
```

**Pros**:
- ✅ Zero risk of infinite loops (dirty flag prevents external updates)
- ✅ Immediate feedback (local state updates instantly)
- ✅ Auto-save with debouncing
- ✅ Can keep React Hook Form for complex operations
- ✅ Easy to extend (undo/redo, conflict detection, manual save)
- ✅ Clear separation of read/write paths

**Cons**:
- ⚠️ Slightly more complex state management
- ⚠️ Need to handle dirty state edge cases

**Verdict**: Best balance of maintainability, features, and safety.

---

## Recommended Approach

### Architecture: Dirty Flag Pattern with Optional Form

**Core Principles**:

1. **Local state for immediate edits** - Users see instant feedback
2. **Dirty flag prevents external interference** - No updates while editing
3. **Debounced auto-save** - Automatic persistence without spam
4. **Optional React Hook Form** - Use when validation/complex operations needed

### Data Flow

```
User interaction
  ↓
Local state update (immediate)
  ↓
Set dirty flag = true
  ↓
Debounced save (500ms)
  ↓
Board state update
  ↓
Clear dirty flag
  ↓
External updates accepted again
```

### Component Structure

```
components/tasks/
├── ticket-card.tsx (wrapper, manages dirty state)
├── sub-tasks/
│   ├── sub-tasks-inline-editor.tsx (NEW - dirty flag logic)
│   ├── sub-tasks-list.tsx (updated - controlled mode)
│   └── sub-task-item.tsx (updated - callbacks instead of form)
└── ticket-form-dialog.tsx (unchanged - keeps form)
```

---

## Implementation Plan

### Phase 1: Create New Components (Low Risk)

**Files to create**:

#### 1.1 Create `sub-tasks-inline-editor.tsx`

```tsx
/**
 * Manages inline editing of sub-tasks with dirty flag pattern
 *
 * Prevents external updates during editing to avoid race conditions.
 * Auto-saves changes with debouncing for performance.
 */
export function SubTasksInlineEditor({
  initialSubTasks,
  onSave,
  readOnly = false,
  debounceMs = 500,
}: SubTasksInlineEditorProps) {
  const [draft, setDraft] = useState(initialSubTasks);
  const [isDirty, setIsDirty] = useState(false);

  // Toggle completion status
  const handleToggle = useCallback((id: string) => {
    const updated = draft.map(st =>
      st.id === id ? { ...st, completed: !st.completed } : st
    );
    setDraft(updated);
    setIsDirty(true);
    debouncedSave(updated);
  }, [draft]);

  // Debounced save to parent
  const debouncedSave = useDebouncedCallback((data: SubTask[]) => {
    onSave(data);
    setIsDirty(false);
  }, debounceMs);

  // Only accept external updates when not editing
  useEffect(() => {
    if (!isDirty) {
      setDraft(initialSubTasks);
    }
  }, [initialSubTasks, isDirty]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  if (readOnly) {
    return <SubTasksReadOnly subTasks={draft} />;
  }

  return (
    <SubTasksEditable
      subTasks={draft}
      onToggle={handleToggle}
      isDirty={isDirty}
    />
  );
}
```

**Tasks**:
- [ ] Create file with TypeScript types
- [ ] Implement dirty flag state management
- [ ] Add debounced save hook
- [ ] Add cleanup on unmount
- [ ] Add JSDoc documentation
- [ ] Write unit tests

**Estimated time**: 2 hours

---

#### 1.2 Create `use-debounced-callback.ts` hook

```tsx
/**
 * Creates a debounced version of a callback function
 *
 * Useful for auto-save functionality to prevent excessive updates.
 *
 * @param callback - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced callback with cancel method
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T & { cancel: () => void } {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useMemo(() => {
    const func = (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    };

    func.cancel = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };

    return func as T & { cancel: () => void };
  }, [delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}
```

**Tasks**:
- [ ] Create hook file
- [ ] Implement with proper TypeScript types
- [ ] Add cancel method
- [ ] Add cleanup
- [ ] Add JSDoc documentation
- [ ] Write unit tests

**Estimated time**: 1 hour

---

### Phase 2: Update Sub-Task Components (Medium Risk)

#### 2.1 Refactor `sub-tasks-list.tsx`

**Current**: Uses React Hook Form with `useFieldArray`

**New**: Accept controlled props OR form control (backward compatible)

```tsx
interface SubTasksListProps {
  // Option 1: Controlled mode (for inline editing)
  subTasks?: SubTask[];
  onToggle?: (id: string) => void;

  // Option 2: Form mode (for dialog)
  control?: Control<TicketFormInput>;
  name?: "subTasks";
}

export function SubTasksList({ subTasks, onToggle, control, name }: SubTasksListProps) {
  // Form mode (existing behavior)
  if (control && name) {
    return <SubTasksListForm control={control} name={name} />;
  }

  // Controlled mode (new behavior)
  if (subTasks && onToggle) {
    return <SubTasksListControlled subTasks={subTasks} onToggle={onToggle} />;
  }

  throw new Error('SubTasksList requires either (control + name) or (subTasks + onToggle)');
}
```

**Tasks**:
- [ ] Add controlled mode props
- [ ] Create `SubTasksListControlled` component
- [ ] Keep `SubTasksListForm` for dialog
- [ ] Update prop types
- [ ] Update JSDoc
- [ ] Test both modes

**Estimated time**: 2 hours

---

#### 2.2 Update `sub-task-item.tsx`

**Current**: Tied to form field

**New**: Support both controlled and form modes

```tsx
interface SubTaskItemProps {
  // Controlled mode
  subTask?: SubTask;
  onToggle?: () => void;

  // Form mode
  field?: ControllerRenderProps;
  index?: number;
}
```

**Tasks**:
- [ ] Make form props optional
- [ ] Add controlled mode props
- [ ] Update checkbox handler
- [ ] Test both modes

**Estimated time**: 1 hour

---

### Phase 3: Update TicketCard (High Risk)

#### 3.1 Remove form from `ticket-card.tsx`

**Current**: Uses `useForm()` to manage sub-tasks

**New**: Use `SubTasksInlineEditor`

```tsx
export function TicketCard({
  ticket,
  onSubTasksChange,
  // ... other props
}: TicketCardProps) {
  const [isSubTaskEditorOpen, setIsSubTaskEditorOpen] = useState(
    (ticket.subTasks?.length ?? 0) > 0
  );

  // REMOVE: useForm, watch, reset logic
  // REMOVE: All useEffect hooks related to form synchronization

  const handleSubTasksSave = useCallback((updatedSubTasks: SubTask[]) => {
    onSubTasksChange?.(updatedSubTasks);
  }, [onSubTasksChange]);

  return (
    <Card>
      {isSubTaskEditorOpen && (
        <SubTasksInlineEditor
          initialSubTasks={ticket.subTasks ?? []}
          onSave={handleSubTasksSave}
        />
      )}
    </Card>
  );
}
```

**Tasks**:
- [ ] Remove `useForm` import and usage
- [ ] Remove `resetSubTaskForm` and `watchSubTaskForm`
- [ ] Remove all form-related useEffect hooks
- [ ] Replace `<SubTasksList control={...} />` with `<SubTasksInlineEditor />`
- [ ] Remove `latestSubTasksSnapshotRef`
- [ ] Update prop types
- [ ] Test inline editing

**Estimated time**: 2 hours

---

### Phase 4: Update Board Column (Low Risk)

#### 4.1 Simplify `board-column.tsx`

**Current**: Creates inline arrow function for each ticket

**New**: Use stable callback reference (already attempted, refine)

```tsx
export function BoardColumn({
  column,
  tickets,
  onUpdateSubTasks,
  // ... other props
}: BoardColumnProps) {

  // Memoize handler creator
  const createUpdateHandler = useCallback(
    (ticketId: string) => (subTasks: SubTask[]) => {
      onUpdateSubTasks(ticketId, subTasks);
    },
    [onUpdateSubTasks]
  );

  return (
    <div>
      {tickets.map((ticket) => (
        <TicketCard
          key={ticket.id}
          ticket={ticket}
          onSubTasksChange={createUpdateHandler(ticket.id)}
        />
      ))}
    </div>
  );
}
```

**Tasks**:
- [ ] Create stable callback with `useCallback`
- [ ] Remove inline arrow function
- [ ] Test that handlers are stable across renders

**Estimated time**: 30 minutes

---

### Phase 5: Cleanup & Optimization (Low Risk)

#### 5.1 Remove unused code

**Files to update**:
- Remove form-related code from `ticket-card.tsx`
- Clean up unused imports
- Remove `serializedTicketSubTasks` memo

**Tasks**:
- [ ] Search for unused variables
- [ ] Remove dead code
- [ ] Update imports
- [ ] Run linter

**Estimated time**: 30 minutes

---

#### 5.2 Add visual feedback for dirty state

**Enhancement**: Show indicator when auto-saving

```tsx
export function SubTasksInlineEditor({ ... }) {
  // ... existing code

  return (
    <div className="relative">
      {isDirty && (
        <div className="absolute top-2 right-2 text-xs text-muted">
          Saving...
        </div>
      )}
      <SubTasksEditable ... />
    </div>
  );
}
```

**Tasks**:
- [ ] Add visual indicator
- [ ] Add success/error states
- [ ] Test UX

**Estimated time**: 1 hour

---

## Testing Strategy

### Unit Tests

**New components to test**:

```typescript
// sub-tasks-inline-editor.test.tsx
describe('SubTasksInlineEditor', () => {
  test('updates local state immediately on toggle', () => {
    // Verify optimistic updates
  });

  test('debounces save calls', () => {
    // Toggle multiple times, verify only one save after delay
  });

  test('prevents external updates while dirty', () => {
    // Change props during edit, verify local state unchanged
  });

  test('accepts external updates when clean', () => {
    // Change props when not editing, verify state updates
  });

  test('cleans up debounced callback on unmount', () => {
    // Verify no memory leaks
  });
});

// use-debounced-callback.test.tsx
describe('useDebouncedCallback', () => {
  test('delays execution', () => {
    // Verify timing
  });

  test('cancels pending calls', () => {
    // Test cancel method
  });

  test('updates callback ref without re-creating debounce', () => {
    // Verify stable reference
  });
});
```

### Integration Tests

**Critical user flows**:

1. **Toggle sub-task in card**
   - [ ] Click checkbox
   - [ ] Verify immediate visual update
   - [ ] Verify debounced save to board
   - [ ] Verify no infinite loops

2. **Toggle then open dialog**
   - [ ] Toggle checkbox
   - [ ] Immediately click edit
   - [ ] Verify dialog shows updated data
   - [ ] Verify no "Maximum update depth" error

3. **Edit in dialog while card auto-saving**
   - [ ] Toggle in card
   - [ ] Open dialog before auto-save completes
   - [ ] Edit in dialog
   - [ ] Verify no conflicts

4. **Multiple rapid toggles**
   - [ ] Toggle checkbox 5 times rapidly
   - [ ] Verify only final state saved
   - [ ] Verify performance (no lag)

### Manual Testing Checklist

- [ ] Toggle sub-task completion in card
- [ ] Add/remove sub-tasks in dialog
- [ ] Drag and drop tickets between columns
- [ ] Drag and drop sub-tasks to reorder
- [ ] Delete sub-task from card
- [ ] Delete sub-task from dialog
- [ ] Create ticket with sub-tasks
- [ ] Edit ticket with sub-tasks
- [ ] Test with slow network (throttle to see auto-save indicator)
- [ ] Test localStorage persistence
- [ ] Test with multiple tickets editing simultaneously

---

## Rollback Plan

### If Issues Arise

**Phase-by-phase rollback**:

1. **Phase 5 issues** → Remove visual feedback, keep functionality
2. **Phase 4 issues** → Revert board-column.tsx, keep other changes
3. **Phase 3 issues** → Revert ticket-card.tsx, keep new components
4. **Phase 2 issues** → Revert sub-tasks components, remove new components
5. **Phase 1 issues** → Delete new files, no other changes needed

**Emergency rollback** (full revert):

```bash
git checkout HEAD -- components/tasks/
git clean -fd components/tasks/
```

### Monitoring After Deploy

**Watch for**:
- Console errors related to "maximum update depth"
- Sub-tasks not saving
- Sub-tasks not updating in real-time
- Performance degradation
- LocalStorage quota errors

**Metrics to track**:
- Error rate in browser console
- Average save latency
- User reports of "lost" sub-task changes

---

## Success Criteria

### Functional Requirements

- [x] ✅ Inline editing works without infinite loops
- [x] ✅ Toggling sub-tasks updates board state
- [x] ✅ Opening dialog after toggle shows correct data
- [x] ✅ No "Maximum update depth exceeded" errors
- [x] ✅ Auto-save works with debouncing
- [x] ✅ LocalStorage persistence maintained

### Non-Functional Requirements

- [x] ✅ Code is simpler and more maintainable
- [x] ✅ No performance degradation
- [x] ✅ All tests pass
- [x] ✅ TypeScript strict mode passes
- [x] ✅ Linter passes
- [x] ✅ Documentation updated

### User Experience

- [x] ✅ Immediate feedback on checkbox toggle
- [x] ✅ Visual indicator during auto-save
- [x] ✅ No UI freezing or lag
- [x] ✅ Existing functionality preserved

---

## Timeline Estimate

| Phase | Tasks | Time | Risk |
|-------|-------|------|------|
| Phase 1 | Create new components | 3 hours | Low |
| Phase 2 | Update sub-task components | 3 hours | Medium |
| Phase 3 | Update TicketCard | 2 hours | High |
| Phase 4 | Update BoardColumn | 30 min | Low |
| Phase 5 | Cleanup & visual feedback | 1.5 hours | Low |
| **Testing** | Unit + Integration + Manual | 4 hours | - |
| **Total** | | **14 hours** | - |

**Recommended approach**: Spread over 2-3 days with testing between phases.

---

## Migration Checklist

### Pre-Implementation

- [ ] Review this document with team
- [ ] Create feature branch: `refactor/subtasks-inline-editing`
- [ ] Backup current localStorage data
- [ ] Document current behavior (video recording)

### During Implementation

- [ ] Complete Phase 1 → Test
- [ ] Complete Phase 2 → Test
- [ ] Complete Phase 3 → Test thoroughly
- [ ] Complete Phase 4 → Test
- [ ] Complete Phase 5 → Test

### Post-Implementation

- [ ] Run full test suite
- [ ] Manual QA testing
- [ ] Performance profiling
- [ ] Update CLAUDE.md if patterns changed
- [ ] Create pull request
- [ ] Code review
- [ ] Merge to main

---

## Notes & Considerations

### Edge Cases to Handle

1. **Unmount during debounce**: Cleanup in useEffect return
2. **Network errors during save**: Retry logic or error UI
3. **Concurrent edits**: Last-write-wins (current behavior)
4. **Large sub-task lists**: Consider virtualization if >50 items

### Future Enhancements

- [ ] Add manual "Save" button for explicit control
- [ ] Add undo/redo for sub-task changes
- [ ] Add conflict detection if multiple devices
- [ ] Add optimistic update rollback on error
- [ ] Add keyboard shortcuts (Ctrl+S to force save)

### Open Questions

1. Should debounce delay be configurable per user?
2. Do we need a "unsaved changes" warning on page unload?
3. Should we add analytics for auto-save success rate?

---

## References

- [React Hook Form Best Practices](https://react-hook-form.com/advanced-usage)
- [Debouncing in React](https://www.developerway.com/posts/debouncing-in-react)
- [Optimistic UI Updates](https://www.apollographql.com/docs/react/performance/optimistic-ui/)
- [Dirty Flag Pattern](https://en.wikipedia.org/wiki/Dirty_bit)

---

**Last Updated**: 2025-10-31
**Author**: Claude Code
**Status**: Ready for Review
