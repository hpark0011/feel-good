# Current Progress - Project Select Clear Bug Investigation

## Date: 2025-10-28

## Problem Statement

**Issue**: When clicking the 'X' button to clear project selection in `project-select.tsx`, the badge shows the previously selected project instead of clearing immediately.

**User-Reported Behavior**:

- Initial state: 'project a' is selected
- User selects 'project b' � displays correctly
- User clicks X icon to clear
- **Bug**: Badge shows 'project a' instead of clearing

**Error in Console**:

```
Error loading localStorage key "docgen.v1.tasks.last-selected-project":
SyntaxError: "undefined" is not valid JSON
  at JSON.parse (<anonymous>)
  at useLocalStorage.useEffect (use-local-storage.ts:19:29)
```

---

## Investigation Timeline

### Step 1: Analyzed `/components/tasks/project-select.tsx`

**Location**: Lines 244-253 (X button click handler)

**Finding**:  Component implementation is CORRECT

```tsx
onClick={() => {
  onValueChange(undefined); // � Correctly passes undefined
}}
```

**Conclusion**: Bug is NOT in ProjectSelect component. Issue must be in parent state management.

---

### Step 2: Analyzed `/components/tasks/ticket-form-dialog.tsx` (Parent)

**Finding**: Uses React Hook Form for state management

```tsx
// Line 55-58
const { form, handleSubmit } = useTicketForm({
  defaultValues,
  onSubmit,
});

// Line 158-160
<ProjectSelect
  value={field.value} // From React Hook Form
  onValueChange={field.onChange} // Updates form.projectId
/>;
```

**Data Flow**:

1. ProjectSelect calls `field.onChange(undefined)`
2. React Hook Form should update `projectId` to `undefined`
3. Component re-renders with new value

**Conclusion**: State management delegated to `useTicketForm` hook.

---

### Step 3: Analyzed `/hooks/use-ticket-form.ts`

**Bug Found #1**: Line 34-36

```typescript
useEffect(() => {
  form.reset(defaultValues);
}, [defaultValues, form]); // � 'form' in dependency array
```

**Issue**: Including `form` in dependency array is a React Hook Form anti-pattern

- Causes form to reset on unrelated re-renders
- Would restore original `defaultValues.projectId` after user clears it

**Bug Found #2**: Line 22-26 - Incomplete fallback

```typescript
defaultValues = {
  title: "",
  description: "",
  status: "backlog",
  // L projectId missing - inconsistent with ticketSchema
};
```

**Initial Assessment**: This useEffect was thought to be the root cause.

---

### Step 4: Analyzed `/hooks/use-dialog-auto-save.ts`

**Finding**: Calls `form.reset()` in two scenarios:

1. User clicks "Cancel" button (line 30)
2. Dialog closes without valid title (line 45)

**Conclusion**: NOT contributing to bug - these only trigger on dialog close, bug happens while dialog is open.

---

### Step 5: =� **CRITICAL DISCOVERY - localStorage Error**

**Error Message**:

```
Error loading localStorage key "docgen.v1.tasks.last-selected-project":
SyntaxError: "undefined" is not valid JSON
```

**Key Insights**:

1. There's localStorage persistence for project selection (key: `"docgen.v1.tasks.last-selected-project"`)
2. Something is writing the **string** `"undefined"` to localStorage (not the value `undefined`)
3. `JSON.parse("undefined")` fails because it's not valid JSON
4. Error occurs in `use-local-storage.ts:19`

**This Changes Everything**: The bug may not be the useEffect in `use-ticket-form.ts` - it could be:

- Improper localStorage serialization of `undefined` values
- localStorage value overriding React Hook Form state on render
- Error fallback restoring previous value

---

## Current Status: Investigation In Progress

**Next Steps**:

1. � Find where `"docgen.v1.tasks.last-selected-project"` is being written
2. � Examine `/hooks/use-local-storage.ts` line 19 - how does it handle undefined?
3. � Determine if localStorage is overriding form state
4. � Find the actual root cause (localStorage vs. useEffect issue)

**Working Theory**:

```
User clicks X
  � onValueChange(undefined) called
  � Something saves "undefined" string to localStorage (incorrect serialization)
  � On next render, reads from localStorage
  � JSON.parse("undefined") throws error
  � Error fallback restores previous value ("project a")
  � Form displays wrong project
```

**Confidence Level**: 60%

- Multiple potential causes identified
- Need to trace localStorage usage to confirm root cause
- useEffect issue in use-ticket-form.ts may be a secondary bug but not primary cause

---

## Files Investigated

1.  `/components/tasks/project-select.tsx` - No issues found
2.  `/components/tasks/ticket-form-dialog.tsx` - Parent component, delegates to hooks
3.  `/hooks/use-ticket-form.ts` - Found useEffect anti-pattern
4.  `/hooks/use-dialog-auto-save.ts` - Not related to bug
5. � `/hooks/use-local-storage.ts` - Need to investigate (error source)
6. � Unknown file(s) writing to `"docgen.v1.tasks.last-selected-project"`

### Step 6: ROOT CAUSE IDENTIFIED

**Files Traced**:
- `/lib/storage-keys.ts` - Defines `LAST_SELECTED_PROJECT` key
- `/hooks/use-last-selected-project.ts` - Hook using `useLocalStorage<string | undefined>`
- `/components/tasks/board.tsx` - Calls `setLastSelectedProjectId(data.projectId)` on form submit (line 260)

**The Complete Bug Chain**:

```
1. User submits form with projectId=undefined (cleared via X button)
   └→ board.tsx handleFormSubmit() called (line 253-260)
   └→ setLastSelectedProjectId(undefined) called (line 260)

2. BUG: use-local-storage.ts setValue() (line 73)
   └→ window.localStorage.setItem(key, JSON.stringify(undefined))
   └→ JSON.stringify(undefined) returns STRING "undefined"
   └→ localStorage now contains: "undefined" (INVALID JSON)

3. Next form open
   └→ useLocalStorage tries to load saved value (line 19)
   └→ JSON.parse("undefined") throws SyntaxError
   └→ Catch block logs error but keeps old storedValue
   └→ Form gets stale value instead of undefined
```

**Root Cause**: `/hooks/use-local-storage.ts` line 73

```typescript
// Line 61-73: setValue function
window.localStorage.setItem(key, JSON.stringify(valueToStore));
```

**Problem**: `JSON.stringify(undefined)` produces the string `"undefined"`, which is NOT valid JSON.

**Why This Happens**:
- `JSON.stringify(null)` → `"null"` (Valid JSON)
- `JSON.stringify(undefined)` → `"undefined"` (Invalid JSON string)
- When value is `undefined`, the key should be REMOVED from localStorage instead of stringified

---

### Step 7: BEST PRACTICE ANALYSIS - Empty Value Handling

**Question Raised**: Should we use empty string `""` instead of `undefined` to avoid localStorage issues?

**Two Options Considered**:

**Option A**: Change entire chain to use empty string
- Schema: `projectId: z.string().default("")`
- Clear button: `onValueChange("")`
- useLastSelectedProject: `useLocalStorage<string>(KEY, "")`
- Fix at domain layer

**Option B**: Keep `undefined` in domain, fix at storage boundary
- Schema: Keep `projectId: z.string().optional()`
- Clear button: Keep `onValueChange(undefined)`
- Fix: `use-local-storage.ts` removes key when value is `undefined`
- Fix at infrastructure layer

**Decision: Option B** ✅

**Why Option B is Best Practice**:

1. **Type Safety**
   ```typescript
   // ✅ Compiler enforces null checks
   projectId: string | undefined
   if (projectId) { /* safe to use */ }
   
   // ❌ No compiler help
   projectId: string
   if (projectId !== "") { /* manual check, easy to forget */ }
   ```

2. **Semantic Clarity**
   - `undefined` = "Has no value" (clear meaning)
   - `""` = "Empty string" OR "no value"? (ambiguous)
   - Avoids "Primitive Obsession" anti-pattern

3. **Industry Standards**
   - React Hook Form recommends `undefined` for optional fields
   - Matches HTML5 spec (unset fields return `undefined`)
   - Works with TypeScript's `?.` optional chaining
   - Integrates with Zod's `.optional()`

4. **Database/API Alignment**
   - SQL: `NULL` ≠ `''`
   - GraphQL: `null` ≠ `""`
   - REST: Omitted field ≠ `null` ≠ `""`

5. **Separation of Concerns**
   - Domain layer: Use semantically correct types (`string | undefined`)
   - Storage layer: Handle serialization concerns
   - Don't pollute domain with storage limitations

**Conclusion**: Fix the storage boundary, not the domain model.

---

## INVESTIGATION COMPLETE - Ready to Fix ✅

**Confidence Level**: 100%

**Root Cause**: `/hooks/use-local-storage.ts` doesn't handle `undefined` values properly

**Solution**: Modify `setValue` function to remove key when value is `undefined`

```typescript
// Proposed fix (line 66-86)
const valueToStore = value instanceof Function ? value(currentStoredValue) : value;

// Handle undefined by removing the key
if (valueToStore === undefined) {
  window.localStorage.removeItem(key);
  
  // Dispatch custom event for same-tab synchronization
  queueMicrotask(() => {
    window.dispatchEvent(
      new CustomEvent('local-storage-change', {
        detail: { key, newValue: undefined },
      })
    );
  });
  
  return undefined;
}

// Otherwise stringify normally
window.localStorage.setItem(key, JSON.stringify(valueToStore));
// ... rest of function
```

**Files That Need Fixing**:

1. **PRIMARY**: `/hooks/use-local-storage.ts` line 66-86
   - Modify `setValue` to handle `undefined` by removing the key instead of stringifying

2. **SECONDARY** (Optional improvements, separate from this bug):
   - `/hooks/use-ticket-form.ts` line 34-36 - Remove `form` from useEffect deps (React Hook Form anti-pattern)
   - `/hooks/use-ticket-form.ts` line 22-26 - Add missing `projectId: undefined` to fallback defaultValues

---

## Complete Files List

1. ✅ `/components/tasks/project-select.tsx` - No issues found
2. ✅ `/components/tasks/ticket-form-dialog.tsx` - Parent component, delegates to hooks
3. ✅ `/hooks/use-ticket-form.ts` - Found useEffect anti-pattern (secondary issue)
4. ✅ `/hooks/use-dialog-auto-save.ts` - Not related to bug
5. ✅ `/hooks/use-local-storage.ts` - **ROOT CAUSE FOUND** (line 73)
6. ✅ `/hooks/use-last-selected-project.ts` - Uses `string | undefined` (correct type)
7. ✅ `/components/tasks/board.tsx` - Calls `setLastSelectedProjectId(undefined)` on submit
8. ✅ `/lib/storage-keys.ts` - Key definition

---

## IMPLEMENTATION - Fix Applied

### Changes Made

#### 1. PRIMARY FIX: `/hooks/use-local-storage.ts` (Lines 72-87)

**What Changed**: Added undefined handling in `setValue` function

**Before**:
```typescript
const valueToStore = value instanceof Function ? value(currentStoredValue) : value;

// Save to localStorage
window.localStorage.setItem(key, JSON.stringify(valueToStore)); // ❌ Breaks on undefined
```

**After**:
```typescript
const valueToStore = value instanceof Function ? value(currentStoredValue) : value;

// Handle undefined by removing the key instead of stringifying
// JSON.stringify(undefined) produces "undefined" (invalid JSON)
if (valueToStore === undefined) {
  window.localStorage.removeItem(key);
  
  // Dispatch custom event for same-tab synchronization
  queueMicrotask(() => {
    window.dispatchEvent(
      new CustomEvent('local-storage-change', {
        detail: { key, newValue: undefined },
      })
    );
  });
  
  return valueToStore;
}

// Save to localStorage
window.localStorage.setItem(key, JSON.stringify(valueToStore)); // ✅ Only called for valid values
```

**Why This Works**:
- When `undefined` is passed, removes the key from localStorage instead of stringifying
- Prevents invalid JSON `"undefined"` from being stored
- Maintains same-tab synchronization via custom event
- Returns `undefined` to update React state correctly

---

#### 2. SECONDARY FIX: `/hooks/use-ticket-form.ts`

**Fix 1: Removed `form` from useEffect dependencies (Line 37)**

**Before**:
```typescript
useEffect(() => {
  form.reset(defaultValues);
}, [defaultValues, form]); // ❌ form in deps causes unwanted resets
```

**After**:
```typescript
useEffect(() => {
  form.reset(defaultValues);
}, [defaultValues]); // ✅ Only reset when defaultValues changes
```

**Why This Matters**:
- React Hook Form's `form` object is stable and shouldn't be in dependency array
- Including it causes form to reset on unrelated re-renders
- This is a documented anti-pattern in React Hook Form

**Fix 2: Added `projectId: undefined` to fallback defaultValues (Line 26)**

**Before**:
```typescript
defaultValues = {
  title: "",
  description: "",
  status: "backlog",
  // ❌ projectId missing - inconsistent with schema
}
```

**After**:
```typescript
defaultValues = {
  title: "",
  description: "",
  status: "backlog",
  projectId: undefined, // ✅ Matches ticketSchema
}
```

**Why This Matters**:
- Ensures fallback defaultValues match the Zod schema shape
- Prevents potential undefined behavior when hook is called without projectId
- Makes the code more explicit and maintainable

---

### Testing Checklist

To verify the fix works:

- [ ] Open ticket form and select a project
- [ ] Click the X button to clear the project selection
- [ ] Badge should disappear (not show old project)
- [ ] No console errors about localStorage
- [ ] Submit form - verify it saves correctly
- [ ] Refresh page - verify last selection is remembered (or cleared if undefined was saved)
- [ ] Open in two tabs - verify changes sync across tabs

---

### Expected Behavior After Fix

**Scenario 1: Clear Project Selection**
```
1. User selects 'project b' → Badge shows "Project B" ✅
2. User clicks X → onValueChange(undefined) called ✅
3. localStorage.removeItem() called ✅
4. Badge disappears ✅
5. No console errors ✅
```

**Scenario 2: Submit with Cleared Project**
```
1. User clears project, submits form
2. setLastSelectedProjectId(undefined) called
3. localStorage key is removed (not set to "undefined")
4. Next form open → reads nothing from localStorage
5. Defaults to undefined ✅
```

**Scenario 3: Submit with Project Selected**
```
1. User selects 'project a', submits form
2. setLastSelectedProjectId('a') called
3. localStorage stores: {"docgen.v1.tasks.last-selected-project": "a"}
4. Next form open → reads "a" from localStorage
5. Defaults to 'project a' ✅
```

---

## Files Modified

1. ✅ `/hooks/use-local-storage.ts` - Added undefined handling (PRIMARY FIX)
2. ✅ `/hooks/use-ticket-form.ts` - Fixed useEffect deps + added projectId to fallback (SECONDARY FIX)

---

## Status: Implementation Complete ✅

**Next Step**: Manual testing to verify the bug is resolved.

If the bug persists, return to this document and review:
1. The bug chain in Step 6
2. The implementation changes above
3. Any error messages in console
4. localStorage contents (check DevTools → Application → Local Storage)

