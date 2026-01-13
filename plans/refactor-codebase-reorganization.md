# ♻️ Refactor: Codebase Reorganization to Reduce Technical Debt

## Overview

This plan addresses critical organizational issues in the Next.js 15 codebase that have led to technical debt, error-prone code, difficult navigation, and high AI token costs. The codebase currently violates its own documented per-route organization pattern (CLAUDE.md), with 25+ files in incorrect locations, empty directories violating YAGNI principles, and unclear boundaries between shared and route-specific code.

**Current State**: Only 1 of 4 routes follows the documented per-route organization pattern
**Target State**: All routes follow per-route organization with clear boundaries and comprehensive documentation
**Impact**: Reduced errors, improved navigability, lower AI token costs, better maintainability

## Problem Statement

### Documented Issues

1. **Convention Violation**: CLAUDE.md explicitly requires per-route organization with `_components/` and `_lib/` directories, but only `/app/insights/` follows this pattern. The other 3 routes (files, tasks, agents) violate this convention.

2. **Scattered Component Locations**:
   ```
   ❌ Current:  /components/tasks/board.tsx (14 files, 3000+ LOC)
   ✅ Expected: /app/(protected)/dashboard/tasks/_components/board.tsx

   ❌ Current:  /hooks/use-project-filter.ts
   ✅ Expected: /app/(protected)/dashboard/tasks/_lib/use-project-filter.ts
   ```

3. **YAGNI Violations**: Three empty directories created "just in case":
   - `/components/navigation/` (empty)
   - `/lib/tasks/` (empty)
   - `/features/` (empty)

   CLAUDE.md explicitly forbids this: "Don't add code because 'we might need it later'"

4. **Unclear Boundaries**:
   - `/lib/` vs `/utils/` distinction is undocumented
   - No clear rule for shared vs route-specific components
   - Server/client component organization not enforced

5. **Mysterious Insights Module**:
   - Undocumented feature with mock data and fictional user names
   - Not mentioned in CLAUDE.md
   - Unclear if production code or prototype

6. **High Cognitive Load**:
   - Developers must search multiple locations for related files
   - Import paths are inconsistent and verbose
   - Related code is scattered across the codebase
   - AI code generation requires excessive context

### Impact on Development

**Error Prone**: When related files are scattered, changes to one file often miss necessary updates in related files, causing runtime errors.

**Hard to Navigate**: Finding task-related code requires checking `/components/tasks/`, `/hooks/`, `/lib/`, and `/app/(protected)/dashboard/tasks/`.

**High Token Costs**: Research shows 80% of wasted tokens in AI-assisted development come from troubleshooting poor implementations caused by unclear architecture (source: Addy Osmani, 2026).

**Onboarding Friction**: New developers (human or AI) struggle to understand where files belong, leading to further violations of organizational patterns.

## Proposed Solution

### Core Strategy: Enforce Per-Route Organization

Implement the **documented per-route organization pattern** from CLAUDE.md consistently across all routes, with clear rules for shared vs route-specific code.

### Organization Pattern

```
app/
  (auth)/
    sign-in/
      _components/        # Sign-in specific components
      _lib/              # Sign-in specific utilities/hooks
      page.tsx
  (protected)/
    dashboard/
      files/
        _components/      # File management components
        _lib/            # File-specific hooks, utilities
        _lib/server/     # Server-only utilities
        page.tsx
      tasks/
        _components/      # Task board components
        _lib/            # Task-specific hooks, state
        _lib/server/     # Server-only task utilities
        page.tsx
      agents/
        _components/      # Agent config components
        _lib/            # Agent-specific utilities
        page.tsx
  _actions/              # Server actions (keep centralized)

components/
  ui/                    # shadcn/ui base components ONLY
  shared/                # Truly shared components (2+ routes)

lib/
  services/              # Business logic services
  schema/                # Zod schemas
  utils.ts               # Pure utility functions
  storage-keys.ts        # Centralized storage keys

hooks/                   # ONLY global/shared hooks

types/                   # Global TypeScript types
  database.ts            # Supabase generated types

utils/                   # DEPRECATE - merge into /lib/
```

### Key Principles

1. **Colocation**: Route-specific code lives with its route in `_components/` and `_lib/`
2. **Shared by Default**: Components in `/components/` must be used by 2+ routes or explicitly designed for reuse
3. **Server Separation**: Server-only code in `_lib/server/` subdirectories
4. **YAGNI Enforcement**: Remove all empty directories, never create "just in case" structure
5. **Clear Documentation**: Every module has clear purpose documented

## Technical Approach

### Architecture Decision: Per-Route vs Feature-Based

**Decision**: Stick with **per-route organization** as documented in CLAUDE.md

**Rationale**:
- Already documented as project standard
- Natural fit for Next.js App Router structure
- Simpler mental model for route-centric application
- Feature-based can be layered on later if needed (YAGNI)

**Alternative Considered**: Feature-based organization (`/features/tasks/`, `/features/files/`)
- **Pros**: Better AI token efficiency (80% reduction from focused context)
- **Cons**: Conflicts with documented standard, requires more refactoring, adds complexity
- **Decision**: Defer until we have evidence current approach is insufficient

### Shared Component Classification Rules

A component belongs in `/components/shared/` if it meets ANY of these criteria:
1. ✅ Currently used by 2+ routes
2. ✅ Explicitly designed as a reusable pattern (e.g., `<DataTable>`, `<EmptyState>`)
3. ✅ Part of the design system (but not shadcn/ui base)

A component belongs in route `_components/` if:
1. ✅ Only used by that specific route
2. ✅ Contains route-specific business logic
3. ✅ Unlikely to be reused elsewhere

**Examples**:
- `<TicketCard>` → `/dashboard/tasks/_components/` (task-specific)
- `<EmptyState>` → `/components/shared/` (generic pattern, might be used in files/agents)
- `<Button>` → `/components/ui/` (shadcn/ui base)

### Server Action Organization

**Decision**: Keep centralized in `/app/_actions/` for now

**Rationale**:
- Current structure is working
- Server actions often shared across routes (e.g., auth actions)
- Can migrate to per-route later if needed (YAGNI)
- Reduces scope of this refactoring

**Future Consideration**: Move route-specific actions to `_actions/` subdirectories when we have 10+ actions per route

### lib vs utils Consolidation

**Decision**: Merge `/utils/` into `/lib/` and document clear purpose

**New Structure**:
```
lib/
  services/              # Business logic (auth, API clients)
  schema/                # Validation schemas
  storage-keys.ts        # LocalStorage key management
  utils.ts               # Pure utility functions (cn, formatters, etc.)
```

**Migration**: Move all content from `/utils/` to `/lib/utils.ts`, delete `/utils/` directory

**Documentation**: Update CLAUDE.md to specify `/lib/` is for all shared utilities and services

### insights Module Disposition

**Decision**: Document and keep the insights module

**Actions**:
1. Add insights module to CLAUDE.md feature list
2. Create `/app/(protected)/dashboard/insights/README.md` explaining purpose
3. Migrate to per-route organization if not already following pattern
4. Remove mock/fictional data if production code, or mark as prototype

**Rationale**: Deleting potentially production code is risky; documentation is safer first step

## Implementation Phases

### Phase 1: Preparation & Analysis (Non-Breaking)

**Objective**: Understand scope and create migration plan without changing code

**Tasks**:
1. ✅ Run research agents (completed)
2. ✅ Analyze SpecFlow gaps (completed)
3. [ ] Create comprehensive file inventory
   - Script to list all component/hook/util files
   - Categorize by current location and target location
   - Identify files with circular dependencies
4. [ ] Document insights module purpose
   - Interview stakeholders or review git history
   - Create `/dashboard/insights/README.md`
   - Add to CLAUDE.md
5. [ ] Check for circular dependencies
   - Run `madge --circular src/` (if madge installed)
   - Document all circular imports
   - Create plan to break circulars
6. [ ] Set up branch strategy
   - Create `refactor/per-route-organization` branch
   - Plan for incremental commits per route

**Success Criteria**:
- [ ] Complete file migration map (CSV/spreadsheet)
- [ ] Zero unknown circular dependencies
- [ ] insights module documented
- [ ] All decisions documented in this plan

**Estimated Complexity**: Medium
**Risk**: Low (no code changes)

### Phase 2: Tasks Module Migration (First Route)

**Objective**: Migrate the largest module (tasks) to establish pattern and identify issues

**Files to Migrate** (~20 files):
```
# Components (14 files, 3000+ LOC)
/components/tasks/board.tsx                    → /dashboard/tasks/_components/board.tsx
/components/tasks/board-column.tsx             → /dashboard/tasks/_components/board-column.tsx
/components/tasks/ticket-card.tsx              → /dashboard/tasks/_components/ticket-card.tsx
/components/tasks/ticket-form.tsx              → /dashboard/tasks/_components/ticket-form.tsx
/components/tasks/project-filter.tsx           → /dashboard/tasks/_components/project-filter.tsx
/components/tasks/columns-config.tsx           → /dashboard/tasks/_components/columns-config.tsx
... (remaining task components)

# Hooks (7 files)
/hooks/use-project-filter.ts                   → /dashboard/tasks/_lib/use-project-filter.ts
/hooks/use-board-state.ts                      → /dashboard/tasks/_lib/use-board-state.ts
/hooks/use-task-form.ts                        → /dashboard/tasks/_lib/use-task-form.ts
... (remaining task hooks)

# Utilities
/lib/tasks/*                                   → /dashboard/tasks/_lib/
```

**Steps**:
1. [ ] Create directory structure
   ```bash
   mkdir -p app/\(protected\)/dashboard/tasks/_components
   mkdir -p app/\(protected\)/dashboard/tasks/_lib
   mkdir -p app/\(protected\)/dashboard/tasks/_lib/server
   ```

2. [ ] Move components one by one
   - Move file
   - Update imports within file (if any)
   - Run TypeScript check
   - Fix errors before next file

3. [ ] Update all imports referencing moved files
   ```bash
   # Find all imports of task components
   grep -r "from.*components/tasks" app/
   grep -r "from.*@/components/tasks" app/

   # Update each import manually or use codemod
   ```

4. [ ] Run validation
   ```bash
   pnpm lint
   pnpm build
   # Manual test: Create task, drag task, update task, delete task
   ```

5. [ ] Commit
   ```bash
   git add app/\(protected\)/dashboard/tasks/_components/
   git add app/\(protected\)/dashboard/tasks/_lib/
   git commit -m "refactor(tasks): migrate to per-route organization

   Move 14 components from /components/tasks/ to /dashboard/tasks/_components/
   Move 7 hooks from /hooks/ to /dashboard/tasks/_lib/
   Update all import paths

   Follows per-route organization pattern documented in CLAUDE.md"
   ```

**Success Criteria**:
- [ ] All task files in correct locations
- [ ] `pnpm build` succeeds
- [ ] `pnpm lint` passes
- [ ] Manual test of task board succeeds
- [ ] No `/components/tasks/` or `/lib/tasks/` remains

**Estimated Complexity**: High (largest module)
**Risk**: Medium (many import updates needed)

### Phase 3: Files Module Migration

**Objective**: Apply learnings from tasks migration to files module

**Files to Migrate** (~10 estimated):
```
/components/files/*      → /dashboard/files/_components/
/hooks/use-file-*        → /dashboard/files/_lib/
/lib/services/files*     → /dashboard/files/_lib/server/ (if route-specific)
```

**Steps**: Same as Phase 2, but faster with established pattern

**Success Criteria**:
- [ ] All file-related code in `/dashboard/files/`
- [ ] Build and lint pass
- [ ] Manual test: Upload file, view files, delete file

**Estimated Complexity**: Medium
**Risk**: Low (pattern established)

### Phase 4: Agents Module Migration

**Objective**: Complete route-specific migrations

**Files to Migrate** (~5 estimated):
```
/components/agents/*     → /dashboard/agents/_components/
/hooks/use-agent-*       → /dashboard/agents/_lib/
```

**Success Criteria**:
- [ ] All agent-related code in `/dashboard/agents/`
- [ ] Build and lint pass
- [ ] Manual test: Create agent, edit agent, delete agent

**Estimated Complexity**: Low
**Risk**: Low

### Phase 5: Insights Module Migration (Conditional)

**Objective**: Migrate insights module if it doesn't already follow pattern

**Prerequisite**: insights module documentation complete (Phase 1)

**Files to Migrate**: TBD based on current structure

**Success Criteria**:
- [ ] insights module follows per-route pattern (if production code)
- [ ] OR insights module removed (if prototype/obsolete)

**Estimated Complexity**: Unknown
**Risk**: Low (can defer if unclear)

### Phase 6: Auth Routes Migration

**Objective**: Migrate authentication route components

**Files to Migrate**:
```
/components/auth/*       → /app/(auth)/{sign-in,sign-up,callback}/_components/
```

**Success Criteria**:
- [ ] Auth components in route directories
- [ ] Manual test: Sign in, sign up, OAuth callback

**Estimated Complexity**: Low
**Risk**: Medium (auth is critical)

### Phase 7: Shared Component Consolidation

**Objective**: Move genuinely shared components to `/components/shared/`

**Tasks**:
1. [ ] Audit remaining `/components/` files
2. [ ] Apply shared component classification rules
3. [ ] Move shared components to `/components/shared/`
4. [ ] Ensure `/components/ui/` contains ONLY shadcn/ui base components

**Success Criteria**:
- [ ] `/components/` structure is clear and documented
- [ ] Every component in `/components/shared/` is used by 2+ routes

**Estimated Complexity**: Low
**Risk**: Low

### Phase 8: lib/utils Consolidation

**Objective**: Clean up utility organization

**Tasks**:
1. [ ] Move all `/utils/` content to `/lib/utils.ts`
2. [ ] Delete `/utils/` directory
3. [ ] Update all imports from `/utils/` to `/lib/utils`
4. [ ] Document `/lib/` structure in CLAUDE.md

**Success Criteria**:
- [ ] `/utils/` directory no longer exists
- [ ] All imports updated
- [ ] CLAUDE.md documents `/lib/` purpose

**Estimated Complexity**: Low
**Risk**: Low

### Phase 9: Empty Directory Cleanup

**Objective**: Remove all YAGNI violations

**Tasks**:
1. [ ] Delete `/components/navigation/` (empty)
2. [ ] Delete `/lib/tasks/` (empty after Phase 2)
3. [ ] Delete `/features/` (empty)
4. [ ] Verify no other empty directories exist
5. [ ] Update `.gitignore` if needed

**Success Criteria**:
- [ ] Zero empty directories in codebase
- [ ] Git status shows deletions

**Estimated Complexity**: Trivial
**Risk**: None

### Phase 10: Documentation & Validation

**Objective**: Comprehensive documentation and final validation

**Tasks**:
1. [ ] Update CLAUDE.md
   - Document new structure
   - Add insights module to feature list
   - Clarify `/lib/` purpose
   - Document shared component rules
   - Add examples of correct organization

2. [ ] Create ARCHITECTURE.md (optional but recommended)
   - Explain per-route organization pattern
   - Document migration rationale
   - Provide import path examples
   - Include decision records

3. [ ] Create import path cheat sheet
   - Common patterns for each route
   - Before/after examples

4. [ ] Final validation
   ```bash
   pnpm lint                           # Must pass
   pnpm build                          # Must succeed
   pnpm supabase:types                 # Regenerate if needed
   ```

5. [ ] Comprehensive manual testing
   - [ ] Sign in / sign up flow
   - [ ] File upload and management
   - [ ] Task board (create, drag, update, delete)
   - [ ] Agent configuration
   - [ ] insights module (if production)

6. [ ] Create migration notes
   - Document before/after structure
   - List all moved files
   - Include in commit message

**Success Criteria**:
- [ ] CLAUDE.md reflects new structure
- [ ] All builds succeed
- [ ] All manual tests pass
- [ ] Documentation is comprehensive

**Estimated Complexity**: Medium
**Risk**: Low

### Phase 11: Team Handoff & Monitoring

**Objective**: Ensure team understands new structure and monitor for issues

**Tasks**:
1. [ ] Team communication
   - Share updated CLAUDE.md
   - Provide import path cheat sheet
   - Explain new organization rules

2. [ ] Monitoring setup
   - Watch error tracking for new issues
   - Monitor CI/CD for build failures
   - Schedule 1-week and 2-week check-ins

3. [ ] Follow-up refinement
   - Gather feedback on new structure
   - Address any confusion
   - Update documentation based on questions

**Success Criteria**:
- [ ] Team trained on new structure
- [ ] No increase in error rates
- [ ] Positive feedback on navigability

**Estimated Complexity**: Low
**Risk**: Low

## Alternative Approaches Considered

### Alternative 1: Feature-Based Architecture

**Description**: Organize by feature rather than route
```
features/
  tasks/
    components/
    hooks/
    services/
    types/
app/
  (protected)/dashboard/tasks/page.tsx  # Just imports from features/tasks
```

**Pros**:
- Better AI token efficiency (focused context, 80% token reduction)
- Clearer feature boundaries
- Easier to add/remove features
- Self-contained modules

**Cons**:
- Conflicts with documented CLAUDE.md standard
- Larger refactoring scope
- More complex mental model
- Requires retraining team on new pattern

**Decision**: Rejected for now, can revisit if per-route proves insufficient (YAGNI)

### Alternative 2: Incremental Route-by-Route Over Multiple PRs

**Description**: Split migration into separate PRs per route rather than one large refactor

**Pros**:
- Smaller code reviews
- Easier to rollback individual routes
- Less risky
- Continuous integration

**Cons**:
- Longer overall timeline
- Temporary inconsistency in codebase
- Multiple context switches
- More overhead

**Decision**: Hybrid approach - one branch with incremental commits per route, single PR review

### Alternative 3: Automated Codemod Migration

**Description**: Use jscodeshift or similar to automate file moves and import updates

**Pros**:
- Faster execution
- Less manual error
- Repeatable if needed

**Cons**:
- Requires writing codemod scripts
- May not handle edge cases
- Still needs manual validation
- Upfront time investment

**Decision**: Manual migration preferred for this size (25 files). Document patterns for future.

### Alternative 4: Keep Current Structure, Just Document It

**Description**: Accept current structure, improve documentation instead of refactoring

**Pros**:
- Zero migration risk
- No breaking changes
- Immediate documentation improvements

**Cons**:
- Doesn't solve navigability issues
- Doesn't reduce token costs
- Continues YAGNI violations
- Tech debt persists

**Decision**: Rejected - problems are real and worsening

## Acceptance Criteria

### Functional Requirements

- [ ] All route-specific components are in route `_components/` directories
- [ ] All route-specific hooks/utilities are in route `_lib/` directories
- [ ] Server-only code is in `_lib/server/` subdirectories
- [ ] Only shadcn/ui base components remain in `/components/ui/`
- [ ] Shared components (2+ routes) are in `/components/shared/`
- [ ] `/utils/` directory no longer exists (merged into `/lib/`)
- [ ] Zero empty directories exist
- [ ] insights module is documented in CLAUDE.md
- [ ] All imports use correct new paths

### Non-Functional Requirements

- [ ] Build time does not increase by more than 10%
- [ ] Bundle size does not increase
- [ ] TypeScript compilation succeeds with zero errors
- [ ] ESLint passes with zero violations
- [ ] All route-specific code can be found in one directory (no scattered files)
- [ ] Import paths are consistent and use path aliases

### Quality Gates

- [ ] `pnpm lint` passes
- [ ] `pnpm build` succeeds
- [ ] `pnpm supabase:types` generates correct types
- [ ] Manual testing checklist 100% complete
- [ ] Code review approved by at least one team member
- [ ] CLAUDE.md updated and accurate
- [ ] No `// TODO` or `// FIXME` comments added during migration

### User-Facing Requirements

- [ ] All authentication flows work (sign in, sign up, OAuth)
- [ ] File upload and management works
- [ ] Task board drag-and-drop works
- [ ] Task CRUD operations work
- [ ] Agent configuration works
- [ ] insights module works (if production feature)
- [ ] No visual regressions
- [ ] No performance degradation

## Success Metrics

### Developer Experience Metrics

**Before Migration**:
- Files per feature scattered across 4+ directories
- 3 empty directories violating YAGNI
- 75% of routes violate documented convention
- No clear shared component rules

**After Migration**:
- All feature files colocated in route directory
- Zero empty directories
- 100% of routes follow documented convention
- Shared component rules documented

### AI Token Efficiency Metrics

**Hypothesis**: Per-route organization reduces token costs by improving context focus

**Measurement**: Track tokens per code generation task
- Baseline: Measure before migration (e.g., "Add feature to task board" costs X tokens)
- Target: 20-30% reduction in tokens for route-specific tasks
- Monitor: Track for 2 weeks post-migration

**Leading Indicators**:
- Fewer "context not found" errors from AI
- Less back-and-forth to locate relevant files
- Fewer hallucinated import paths

### Code Quality Metrics

- [ ] Circular dependencies: 0 (measure before/after)
- [ ] Import path inconsistencies: 0
- [ ] Files in wrong location: 0 (currently 25+)
- [ ] Undocumented modules: 0 (currently 1 - insights)

### Timeline Metrics

- [ ] Phase 1 (Preparation): 1-2 days
- [ ] Phase 2-6 (Route Migrations): 3-5 days
- [ ] Phase 7-9 (Consolidation): 1-2 days
- [ ] Phase 10-11 (Documentation & Handoff): 1-2 days
- **Total**: 6-11 days elapsed (depends on team size and parallelization)

## Dependencies & Prerequisites

### Required Before Starting

1. ✅ CLAUDE.md exists and documents per-route pattern (confirmed)
2. ✅ Git repository with clean working directory
3. ✅ All team members aware of upcoming refactor
4. [ ] Backup/snapshot of current codebase
5. [ ] CI/CD pipeline is green
6. [ ] No other major refactors in progress

### External Dependencies

- **None** - this is purely an internal refactoring

### Team Dependencies

- [ ] Code review availability for large PR
- [ ] QA/testing availability for validation
- [ ] Stakeholder approval for insights module disposition

### Technical Prerequisites

- [ ] Node.js and pnpm installed
- [ ] TypeScript configured correctly
- [ ] ESLint configured and passing
- [ ] Supabase CLI for type generation
- [ ] (Optional) madge or similar for circular dependency detection

## Risk Analysis & Mitigation

### High-Risk Areas

#### Risk 1: Breaking Runtime Imports

**Probability**: High
**Impact**: High (application doesn't load)

**Mitigation**:
- [ ] Use TypeScript to catch import errors at compile time
- [ ] Search entire codebase for old import patterns before declaring complete
- [ ] Test in development environment first
- [ ] Keep feature branch until validation complete

**Rollback**: Single `git revert` of merge commit

#### Risk 2: Circular Dependencies Block Migration

**Probability**: Medium
**Impact**: High (must refactor dependencies first)

**Mitigation**:
- [ ] Scan for circulars in Phase 1 before any moves
- [ ] Document all circulars and create break plan
- [ ] Move files in order that breaks circulars naturally

**Rollback**: Not applicable (would discover before starting)

#### Risk 3: Insights Module is Production-Critical

**Probability**: Unknown
**Impact**: High if true (can't delete or break)

**Mitigation**:
- [ ] Document insights module in Phase 1
- [ ] Consult stakeholders before any changes
- [ ] If uncertain, leave as-is and just document

**Rollback**: Don't touch insights until purpose is clear

### Medium-Risk Areas

#### Risk 4: Import Path Updates are Incomplete

**Probability**: Medium
**Impact**: Medium (some features broken)

**Mitigation**:
- [ ] Use grep/ripgrep to find ALL references before declaring complete
- [ ] Search for multiple patterns: `from "@/components/tasks`, `from "../../components/tasks`, etc.
- [ ] Run build after each route migration to catch errors early

**Rollback**: Fix missing imports (usually caught by TypeScript)

#### Risk 5: Team Confusion About New Structure

**Probability**: Medium
**Impact**: Medium (regression to old patterns)

**Mitigation**:
- [ ] Update CLAUDE.md with clear examples
- [ ] Create import path cheat sheet
- [ ] Schedule team walkthrough of new structure
- [ ] Add PR template reminder about per-route organization

**Rollback**: Additional documentation and training

#### Risk 6: Build Time Increases

**Probability**: Low
**Impact**: Medium (slower development)

**Mitigation**:
- [ ] Benchmark build time before and after
- [ ] If increase >10%, investigate (shouldn't happen from just moving files)
- [ ] Consider Next.js build cache optimization if needed

**Rollback**: Not applicable (moving files shouldn't affect build time)

### Low-Risk Areas

#### Risk 7: Merge Conflicts with Other Branches

**Probability**: Low (if coordinated)
**Impact**: Low (can resolve)

**Mitigation**:
- [ ] Coordinate with team to avoid simultaneous large refactors
- [ ] Communicate branch creation in team chat
- [ ] Merge frequently from main to minimize drift

**Rollback**: Standard merge conflict resolution

## Resource Requirements

### Developer Time

- **Primary Developer**: 6-11 days full-time
  - Phase 1: 1-2 days
  - Phases 2-9: 4-7 days
  - Phases 10-11: 1-2 days

- **Code Reviewer**: 2-4 hours
  - Review migration map
  - Review moved files and import updates
  - Validate documentation

- **QA/Testing**: 2-4 hours
  - Manual testing checklist
  - Exploratory testing
  - Regression testing

**Total**: ~48-96 developer hours

### Infrastructure

- **None** - no infrastructure changes required

### Tools

- **Required**:
  - Git (version control)
  - TypeScript (import validation)
  - ESLint (code quality)

- **Optional**:
  - madge (circular dependency detection)
  - jscodeshift (if automating codemods)
  - ripgrep (faster import searching)

## Future Considerations

### Post-Migration Improvements

Once per-route organization is established, consider these future enhancements (YAGNI - only do if needed):

1. **Feature-Based Architecture Layer**
   - If routes grow to 50+ files each, extract to `/features/`
   - Measure: If a route has >50 files OR >5 developers work on it

2. **Route-Specific Server Actions**
   - Move from `/app/_actions/` to route `_actions/` folders
   - Measure: When routes have 10+ actions each

3. **Component Library Extraction**
   - Extract `/components/shared/` to separate package
   - Measure: When shared components are used by 5+ projects

4. **Automated Import Organization**
   - Add ESLint rules to enforce import patterns
   - Add pre-commit hooks to prevent wrong locations
   - Measure: If >2 violations per week occur

5. **Monorepo Conversion**
   - Split into separate apps (web, admin, mobile)
   - Measure: When building truly separate applications

### Extensibility

This organization pattern supports future growth:

- **New Routes**: Simply create `_components/` and `_lib/` in route directory
- **New Features**: Add to appropriate route or create new route
- **Shared Components**: Move to `/components/shared/` when used by 2nd route
- **Microservices**: Route-specific code can be extracted to services easily

### Long-Term Vision

**Target State** (12-18 months):
- All routes follow per-route organization
- AI token costs reduced by 30-50% for route-specific tasks
- New developers onboard in <1 day (understand structure immediately)
- Zero "where does this file go?" questions
- Feature development is 20% faster due to improved navigability

**Success Indicators**:
- Developers say "I can find everything related to tasks in one place"
- AI assistants generate correct import paths on first try
- New features maintain organization without prompting
- Tech debt tickets related to organization = 0

## Documentation Plan

### Files to Create

1. **`/plans/refactor-codebase-reorganization.md`** (this file)
   - Comprehensive migration plan
   - Decision rationale
   - Implementation phases

2. **`/app/(protected)/dashboard/insights/README.md`** (Phase 1)
   - Purpose of insights module
   - Features and functionality
   - Data sources and mock/real status

3. **`/docs/ARCHITECTURE.md`** (Phase 10, optional)
   - Per-route organization pattern
   - Component classification rules
   - Import path conventions
   - Decision records

4. **`/docs/IMPORT_PATHS.md`** (Phase 10)
   - Cheat sheet of common import patterns
   - Before/after examples
   - Path alias reference

### Files to Update

1. **`CLAUDE.md`** (Phase 10)
   - Document insights module in feature list
   - Clarify `/lib/` purpose (after utils merge)
   - Add shared component classification rules
   - Include organization examples
   - Update project structure section

2. **`README.md`** (Phase 10, if exists)
   - Update getting started if it references old paths
   - Add link to architecture documentation

3. **`.gitignore`** (Phase 9, if needed)
   - Remove any references to deleted empty directories

### Documentation Standards

- All documentation in Markdown
- Use mermaid diagrams for complex relationships (optional)
- Include code examples for import patterns
- Link between related docs
- Keep CLAUDE.md as source of truth for conventions

## References & Research

### Internal References

**Current Organization Violations**:
- `/components/tasks/board.tsx:1-500` (should be in route `_components/`)
- `/hooks/use-project-filter.ts:1-50` (should be in route `_lib/`)
- `/lib/tasks/` (empty, YAGNI violation)

**Configuration**:
- `CLAUDE.md:16-40` - Project structure documentation
- `CLAUDE.md:140-160` - YAGNI and KISS principles
- `tsconfig.json:5-10` - Path alias configuration

**Successful Patterns to Preserve**:
- `/lib/storage-keys.ts` - Centralized key management
- `/app/(protected)/dashboard/insights/` - Only route following convention
- Good JSDoc documentation on hooks

### External References

**Next.js 15 Documentation**:
- [Project Structure](https://nextjs.org/docs/app/getting-started/project-structure) - Official App Router organization
- [Route Groups](https://nextjs.org/docs/app/getting-started/project-structure#route-groups) - `(group)` pattern
- [Private Folders](https://nextjs.org/docs/app/getting-started/project-structure#private-folders) - `_folder` pattern

**React 19 Best Practices**:
- [Server Components](https://react.dev/reference/rsc/server-components) - Server/client boundaries
- [React 19 TypeScript Best Practices](https://medium.com/@CodersWorld99/react-19-typescript-best-practices-the-new-rules-every-developer-must-follow-in-2025-3a74f63a0baf)

**Modern Organization Patterns (2026)**:
- [Next.js Project Structure Guide](https://www.wisp.blog/blog/the-ultimate-guide-to-organizing-your-nextjs-15-project-structure)
- [Feature-Driven Architecture](https://dev.to/rufatalv/feature-driven-architecture-with-nextjs-a-better-way-to-structure-your-application-1lph)
- [Building Scalable Folder Structure](https://utsavdesai26.medium.com/building-a-scalable-folder-structure-for-large-next-js-projects-d6ca0349f4c8)

**AI-Optimized Codebase Architecture**:
- [Addy Osmani - AI Coding Workflow 2026](https://addyosmani.com/blog/ai-coding-workflow/) - 80% token waste from poor implementations
- [AI-Optimized Architecture](https://medium.com/@richardhightower/ai-optimizing-codebase-architecture-for-ai-coding-tools-ff6bb6fdc497)

**Example Projects**:
- [shadcn/ui Taxonomy](https://github.com/shadcn-ui/taxonomy) - Canonical Next.js example
- [next-forge](https://www.next-forge.com/) - Production-grade template

### Related Work

**Previous Discussions**:
- Initial CLAUDE.md creation (commit: unknown)
- Per-route convention documentation (current)

**Related Issues**:
- None yet - this is first major organization refactor

**Research Agents**:
- repo-research-analyst (agent ID: a1d6345)
- best-practices-researcher (agent ID: a88e731)
- framework-docs-researcher (agent ID: acce90c)
- spec-flow-analyzer (agent ID: a85f349)

## Open Questions

### Critical (Block Implementation)

1. **insights Module Purpose** (Phase 1)
   - Is this production code or a prototype?
   - Should it be kept, removed, or migrated?
   - Who are the stakeholders?

2. **Server Action Organization Confirmation** (Before Phase 2)
   - Confirm keeping `/app/_actions/` centralized
   - Or should we migrate to per-route `_actions/`?

### Important (Affect Quality)

3. **Circular Dependencies** (Phase 1)
   - Do any circular dependencies exist?
   - Which files are involved?
   - How should they be broken?

4. **Nested Route Clarification** (Before Phase 2)
   - For routes like `/tasks/[id]/`, where do components go?
   - Parent `_components/` or child `_components/`?

5. **Testing Strategy** (Before Phase 10)
   - What level of manual testing is required?
   - Are there automated tests?
   - Which user flows must be validated?

### Nice-to-Have (Improve Clarity)

6. **Team Availability** (Before Starting)
   - Who can review the large PR?
   - When is best time for minimal disruption?

7. **Deployment Strategy** (Phase 11)
   - Deploy to staging first?
   - Gradual rollout or all at once?

## ERD / Architecture Diagram

```mermaid
graph TB
    subgraph "Current Structure (Problems)"
        A[/components/tasks/] -.->|Scattered| B[/hooks/use-task-*]
        A -.->|Scattered| C[/lib/tasks/]
        A -.->|Scattered| D[/app/dashboard/tasks/]
        E[/components/files/] -.->|Scattered| F[/hooks/use-file-*]
        G[Empty YAGNI] -.->|Violation| H[/features/]
        G -.->|Violation| I[/lib/tasks/]
    end

    subgraph "Target Structure (Solution)"
        J[/app/dashboard/tasks/]
        J --> K[_components/]
        J --> L[_lib/]
        J --> M[_lib/server/]
        J --> N[page.tsx]

        O[/app/dashboard/files/]
        O --> P[_components/]
        O --> Q[_lib/]
        O --> R[page.tsx]

        S[/components/]
        S --> T[ui/ - shadcn only]
        S --> U[shared/ - 2+ routes]

        V[/lib/]
        V --> W[services/]
        V --> X[schema/]
        V --> Y[utils.ts]
    end

    subgraph "Shared Resources"
        Z[/app/_actions/] -->|Used by| J
        Z -->|Used by| O
        T -->|Used by| J
        T -->|Used by| O
        U -->|Used by| J
        U -->|Used by| O
    end

    style G fill:#ffcccc
    style H fill:#ffcccc
    style I fill:#ffcccc
    style A fill:#ffffcc
    style B fill:#ffffcc
    style C fill:#ffffcc
    style E fill:#ffffcc
    style F fill:#ffffcc

    style K fill:#ccffcc
    style L fill:#ccffcc
    style P fill:#ccffcc
    style Q fill:#ccffcc
```

**Legend**:
- 🔴 Red (current): YAGNI violations / empty directories
- 🟡 Yellow (current): Files in wrong locations
- 🟢 Green (target): Correct per-route organization

## Commit Message Template

```
refactor: reorganize codebase to eliminate technical debt

Migrate 25+ files to documented per-route organization pattern:

Breaking Changes:
- All task components moved: /components/tasks/* → /dashboard/tasks/_components/*
- All file components moved: /components/files/* → /dashboard/files/_components/*
- All agent components moved: /components/agents/* → /dashboard/agents/_components/*
- Route-specific hooks moved from /hooks/* to route _lib/ directories
- /utils/ merged into /lib/utils.ts (import paths changed)

Improvements:
- Remove empty directories (/features/, /lib/tasks/, /components/navigation/)
- Consolidate lib/utils with clear documentation
- Document insights module purpose
- Update CLAUDE.md with organization rules and examples
- Add shared component classification criteria

Migration Details:
- Phase 1-2: Tasks module (14 components, 7 hooks)
- Phase 3: Files module (~10 files)
- Phase 4: Agents module (~5 files)
- Phase 5: insights module (documented)
- Phase 6: Auth routes
- Phase 7-9: Shared components and lib consolidation
- Phase 10-11: Documentation and validation

All routes now follow per-route organization pattern documented in CLAUDE.md:
- Route-specific code in _components/ and _lib/
- Server-only code in _lib/server/
- Shared components (2+ routes) in /components/shared/
- shadcn/ui base components remain in /components/ui/

Testing:
- ✅ TypeScript compilation succeeds
- ✅ ESLint passes
- ✅ Build succeeds
- ✅ All user flows tested (auth, files, tasks, agents)

Documentation:
- Updated CLAUDE.md with new structure and rules
- Added insights/README.md
- Created ARCHITECTURE.md with organization pattern
- Created IMPORT_PATHS.md cheat sheet

Resolves: Technical debt from scattered organization
Improves: Navigability, AI token efficiency, maintainability
Follows: YAGNI and KISS principles from CLAUDE.md

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## Summary

This plan addresses critical technical debt by migrating the codebase to the documented per-route organization pattern. The refactor will:

- ✅ Fix 25+ files in wrong locations
- ✅ Remove 3 empty directories violating YAGNI
- ✅ Establish clear boundaries between shared and route-specific code
- ✅ Improve navigability and reduce cognitive load
- ✅ Reduce AI token costs through better code organization
- ✅ Provide comprehensive documentation for future development

**Timeline**: 6-11 days
**Risk**: Medium (large refactor, but with mitigation strategies)
**Impact**: High (foundational improvement to development experience)

**Next Steps**: Review and approve this plan, then proceed with Phase 1 preparation.
