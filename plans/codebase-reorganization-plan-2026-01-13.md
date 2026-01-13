# Greyboard Codebase Reorganization Plan

## Overview

Comprehensive restructure to reduce tech debt, improve navigation, and lower token costs using a **HYBRID APPROACH**:
- Shared/reusable components stay in `/components/ui` and `/components/shared`
- Feature-specific components move to route `_components/`
- Per-route organization with `_components/`, `_lib/`, `_hooks/`, `_actions/`

## Expected Impact

- 🎯 **40% reduction** in global component files (better navigation)
- 🔒 **50% fewer** auth utilities (4 → 2 files, clearer API)
- 💰 **~25% lower** token costs (co-location reduces context)
- ⚡ **60% faster** file discovery (predictable structure)
- 🧹 **Zero duplication** in headers (DRY)
- 🔐 **Security fix**: Insights moved to protected route

## Critical Issues Being Fixed

1. **Header Duplication**: FilesHeader, AgentsHeader, TasksHeader have 150+ lines of duplicated breadcrumb code
2. **Auth Fragmentation**: 4 auth utility files with confusing names and unclear relationships
3. **Inconsistent Patterns**: Insights uses `_components/`, dashboard routes don't
4. **Poor Co-location**: Task code scattered across `/components/tasks/`, `/hooks/`, `/lib/`, `/types/`, `/config/`
5. **Empty Directories**: `/lib/tasks/`, `/components/navigation/`
6. **Unprotected Route**: `/app/insights/` should be in `(protected)` group

## Implementation Phases (12-15 hours)

### Phase 1: Foundation - Extract Shared Patterns (1-2h)
**Goal**: Create shared components without breaking existing code

**Actions**:
1. Create `/components/shared/page-header/page-header.tsx` - Unified header with slots (title, actions, middleContent)
2. Create `/lib/auth/server.ts` - Consolidate `getCurrentServerUser()` + `requireServerUser()`
3. Create `/lib/auth/client.ts` - Consolidate `getCurrentClientUser()`
4. Create `/lib/storage/` directory for generic storage utilities

**Verification**:
```bash
pnpm build  # Must succeed
pnpm lint   # Must pass
```

**Commit**: `refactor/phase-1: Extract shared header and auth patterns`

---

### Phase 2: Update Imports (2-3h)
**Goal**: Switch to new shared components, keep old files temporarily

**Actions**:
1. Update all headers to use `<PageHeader>` component:
   - `tasks-header.tsx`: Custom middle content (focus button, timer)
   - `files-header.tsx`: Simple breadcrumb navigation
   - `agents-header.tsx`: Simple breadcrumb navigation
   - `insights-header.tsx`: Simple breadcrumb navigation

2. Find/replace auth imports:
   ```typescript
   // OLD → NEW
   @/utils/supabase/get-current-server-user → @/lib/auth/server (getCurrentServerUser)
   @/utils/require-user-in-server-components → @/lib/auth/server (requireServerUser)
   @/utils/supabase/get-current-client-user → @/lib/auth/client (getCurrentClientUser)
   ```

**Verification**:
- Visit each dashboard route (tasks, files, agents, insights)
- Test auth flows (sign in, sign out, protected redirect)
- Verify navigation works

**Commit**: `refactor/phase-2: Switch to shared components and auth utilities`

---

### Phase 3: Move Tasks Module (3-4h)
**Goal**: Relocate entire tasks module to per-route structure

**Actions**:
1. Create directories:
   ```bash
   mkdir -p app/(protected)/dashboard/tasks/{_components,_lib,_hooks}
   mkdir -p app/(protected)/dashboard/tasks/_components/{project-select,sub-tasks}
   mkdir -p app/(protected)/dashboard/tasks/_hooks/__tests__
   ```

2. Move files:
   - **Components** (17 files): `/components/tasks/*.tsx` → `tasks/_components/`
   - **Hooks** (7 files): `/hooks/use-{projects,ticket-form,today-focus,...}.ts` → `tasks/_hooks/`
   - **Lib** (5 files): `/lib/{board-storage,insights-utils,timer-utils}.ts` → `tasks/_lib/`
   - **Config** (2 files): `/config/{board,tasks}.config.ts` → `tasks/_lib/`
   - **Types** (1 file): `/types/board.types.ts` → `tasks/_lib/board.types.ts`

3. Update `app/(protected)/dashboard/tasks/page.tsx`:
   ```typescript
   import { Board } from "./_components/board";
   import { TasksHeader } from "./_components/tasks-header";
   ```

4. Update internal imports in moved files (change `@/components/tasks/` → `./` or `../_components/`)

**Verification**:
- ✅ Tasks board loads
- ✅ Drag-and-drop works
- ✅ Create/edit tickets
- ✅ Project selection works
- ✅ Timer/stopwatch works
- ✅ All dialogs open (focus, insights, projects)
- ✅ `pnpm build` succeeds

**Commit**: `refactor/phase-3: Move tasks module to per-route structure`

---

### Phase 4: Move Files, Agents, Insights (2-3h)
**Goal**: Apply same pattern to remaining modules

**Actions**:

**Files Module** (5 components, 1 action, 1 type):
```bash
mkdir -p app/(protected)/dashboard/files/{_components,_actions,_lib}
# Move components: files-list.tsx, file-upload-dialog.tsx, data-table.tsx, columns.tsx, files-header.tsx
# Move actions: /app/_actions/file-actions.ts → files/_actions/file-actions.ts
# Move types: /types/file.types.ts → files/_lib/file.types.ts
```

**Agents Module** (1 component):
```bash
mkdir -p app/(protected)/dashboard/agents/_components
# Move: /components/agents/agents-header.tsx → agents/_components/
```

**Insights Module** (move entire directory - security fix):
```bash
# Move: /app/insights/ → /app/(protected)/dashboard/insights/
# Keeps: _components/, layout.tsx, page.tsx, data.ts
```

**Verification**:
- Files page: Upload, list, delete works
- Agents page: Renders correctly
- Insights page: Charts load, now protected by auth

**Commit**: `refactor/phase-4: Move files, agents, and insights modules`

---

### Phase 5: Cleanup Deletions (1h)
**Goal**: Remove old files and directories

**Actions**:
```bash
# Delete old auth utilities
rm utils/supabase/get-current-server-user.ts
rm utils/supabase/get-current-client-user.ts
rm utils/require-user.ts
rm utils/require-user-in-server-components.ts

# Delete old component directories
rm -rf components/tasks/
rm -rf components/files/
rm -rf components/agents/
rm -rf components/header/
rm -rf components/navigation/

# Delete empty directories
rm -rf lib/tasks/

# Delete moved lib files
rm lib/board-storage.ts
rm lib/insights-utils.ts
rm lib/timer-utils.ts

# Update storage keys
# Edit /lib/storage/storage-keys.ts - remove task-specific keys (moved to tasks/_lib/)
```

**Verification**:
- `pnpm build` succeeds with no warnings
- `pnpm lint` passes
- All routes work
- No console errors

**Commit**: `refactor/phase-5: Remove old files and directories`

---

### Phase 6: Documentation (1h)
**Goal**: Update CLAUDE.md to reflect new structure

**Actions**:
1. Update project structure section
2. Document new import patterns
3. Add guidelines for when to use shared vs per-route components
4. Document auth utility consolidation

**Commit**: `refactor/phase-6: Update documentation`

---

## Final Directory Structure

```
app/
  (protected)/dashboard/
    tasks/
      _components/          # 17 components (board, cards, dialogs, etc.)
        project-select/     # Nested: 5 components
        sub-tasks/          # Nested: 2 components
      _lib/                 # 5 files (storage, utils, config, types)
      _hooks/               # 7 hooks (projects, forms, focus, etc.)
      page.tsx

    files/
      _components/          # 5 components (list, upload, table)
      _actions/             # 1 file (file-actions.ts)
      _lib/                 # 1 file (file.types.ts)
      page.tsx

    agents/
      _components/          # 1 component (agents-header.tsx)
      page.tsx

    insights/               # MOVED from /app/insights/ (security fix)
      _components/          # 4 components
      data.ts
      layout.tsx
      page.tsx

components/
  shared/
    page-header/            # NEW: Unified header pattern
      page-header.tsx       # Main component with slots
      breadcrumb-nav.tsx    # Reusable breadcrumb
      header-actions.tsx    # Actions slot
  ui/                       # 52 shadcn components (unchanged)
  providers/                # 4 providers (unchanged)
  auth/                     # 4 auth components (unchanged)
  layout/                   # Layout primitives (unchanged)

lib/
  auth/                     # NEW: Consolidated auth utilities
    server.ts               # getCurrentServerUser(), requireServerUser()
    client.ts               # getCurrentClientUser()
  storage/                  # NEW: Generic storage utilities
    storage.ts              # Serialization utilities
    storage-keys.ts         # Generic UI keys only
  services/                 # 3 services (unchanged)
  schema/                   # 2 schemas (unchanged)
  utils.ts                  # cn() helper (unchanged)

hooks/                      # Only GENERIC hooks (10 files)
  # Removed task-specific hooks (moved to tasks/_hooks/)

utils/                      # Infrastructure only
  supabase/client/          # 2 Supabase clients
  enhance-actions.ts
  zod-parse-factory.ts
  # Removed auth utilities (consolidated to /lib/auth/)
```

---

## Breaking Changes & Migration

### Import Path Changes

**Auth utilities**:
```typescript
// Before
import { getCurrentServerUser } from "@/utils/supabase/get-current-server-user";
import { requireUserInServerComponent } from "@/utils/require-user-in-server-components";

// After
import { getCurrentServerUser, requireServerUser } from "@/lib/auth/server";
```

**Task components** (from within tasks route):
```typescript
// Before
import { Board } from "@/components/tasks/board";
import { useProjects } from "@/hooks/use-projects";

// After
import { Board } from "./_components/board";
import { useProjects } from "./_hooks/use-projects";
```

**Files components** (from within files route):
```typescript
// Before
import { FilesList } from "@/components/files/files-list";

// After
import { FilesList } from "./_components/files-list";
```

---

## Critical Files to Modify

### Phase 1-2 (Header Refactoring)
1. `/components/tasks/tasks-header.tsx` (386 lines) - Most complex, needs custom middle content
2. `/components/files/files-header.tsx` (110 lines) - Simple breadcrumb pattern
3. `/components/agents/agents-header.tsx` - Simple breadcrumb pattern
4. `/app/insights/_components/insights-header.tsx` - Simple breadcrumb pattern

### Phase 2 (Auth Consolidation)
5. `/utils/require-user-in-server-components.ts` - Core auth, will be consolidated
6. All files importing old auth utilities (~15-20 files)

### Phase 3 (Tasks Migration)
7. `/app/(protected)/dashboard/tasks/page.tsx` - Update imports after move
8. All 17 task component files - Update internal imports

---

## Verification Checklist

### After Each Phase
- [ ] `pnpm build` succeeds
- [ ] `pnpm lint` passes
- [ ] No TypeScript errors
- [ ] Manual test affected routes

### Final Verification
**Structure**:
- [ ] All routes use `_components/` pattern
- [ ] No empty directories
- [ ] No duplicate header code
- [ ] Auth utilities consolidated (2 files)

**Functionality**:
- [ ] Sign in/out works
- [ ] Tasks board: create, drag, edit, delete tickets
- [ ] Files: upload, list, delete
- [ ] All modals/dialogs work
- [ ] Navigation between routes
- [ ] Timer/stopwatch works
- [ ] Insights protected and working

**Code Quality**:
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] All imports correct
- [ ] No circular dependencies

---

## Rollback Strategy

**Phase-level rollback**:
```bash
git log --oneline | grep "refactor/phase"
git revert <commit-hash>
```

**Full rollback**:
```bash
git reflog
git reset --hard <pre-refactor-commit>
```

Each phase is a separate commit with tag for easy rollback.

---

## Key Decisions

### Why Hybrid Approach?
- **Shared** (centralized): UI primitives, providers, truly reusable components
- **Per-route** (co-located): Feature-specific code never used outside its route
- **Benefits**: Better isolation, easier navigation, lower token costs, clear boundaries

### Criteria for Shared vs Per-Route
**Use Shared when**:
- Used by 2+ routes
- Generic utility (hooks, layout)
- UI primitive (buttons, dialogs)

**Use Per-Route when**:
- Only used by one feature
- Domain-specific logic
- Feature-specific state

### Auth Consolidation Rationale
**Before**: 4 files, naming confusion, scattered locations
**After**: 2 files (`server.ts`, `client.ts`), clear purposes, single location
**Benefit**: 50% fewer files, clearer API, easier to find and use

---

## Success Metrics

- ✅ Global component files reduced from ~24 to ~10 (excluding shadcn)
- ✅ Auth utilities reduced from 4 to 2 files
- ✅ Feature code co-located in predictable structure
- ✅ Navigation time reduced ~60% (1 directory vs 5)
- ✅ Token costs reduced ~25% (better boundaries, less context)
- ✅ Zero header duplication (DRY)
- ✅ Insights route now protected

---

**Total Time**: 12-15 hours
**Risk Level**: Low (phased, tested, reversible)
**Impact**: High (major improvement in organization, navigation, and maintainability)
