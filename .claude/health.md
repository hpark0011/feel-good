# Context Health Report

**Generated**: 2025-01-13 14:50:00
**Status**: NEEDS_UPDATE
**Last Full Sync**: 2025-01-13

---

## Summary

- **Total Discrepancies**: 7
- **Critical Issues**: 0
- **Warnings**: 7

---

## Discrepancies Found

### 1. Project Structure

❌ **Undocumented directories**:
- `app/fonts/` - Contains custom font files (Inter, Instrument Serif)
- `app/auth/callback/` - Supabase auth callback route (mentioned inline but not in structure)
- `icons/` - Icon assets directory
- `public/` - Standard Next.js public assets folder
- `plans/` - Planning/documentation files (may not need documentation)
- `features/` - Empty directory (may not need documentation)

✅ All major documented directories exist and are accurate

### 2. Tech Stack

✅ **Next.js 15.4.10** - Correctly documented (matches package.json)
✅ **React 19.1.0** - Correctly documented
✅ **All major dependencies correctly documented** (@dnd-kit, TanStack Query, Zustand, Framer Motion, Recharts, shadcn/ui, Supabase, Tailwind CSS 4)

### 3. Patterns

✅ **All pattern files have valid frontmatter**:
- `composition-pattern.md` - Valid (name, category, applies_to, updated, documented_in)
- `features-pattern.md` - Valid (name, category, applies_to, updated, documented_in)
- `page-view-providers-pattern.md` - Valid (name, category, applies_to, updated, documented_in)
- `server-client-separation-pattern.md` - Valid (name, category, applies_to, updated, documented_in)

### 4. Custom Hooks

⚠️ **Hooks count discrepancy**: CLAUDE.md states "18+" hooks, but only 17 hooks found:

**Actual hooks** (17 total):
1. use-mobile.ts
2. use-theme-toggle.tsx
3. use-navigation.ts
4. use-today-focus.ts
5. use-focus-management.ts
6. use-keyboard-submit.ts
7. use-project-filter.ts
8. use-last-selected-project.ts
9. use-dialog-auto-save.ts
10. use-local-storage.ts
11. use-project-selection.ts
12. use-search-state.ts
13. use-projects.ts
14. use-keyboard-navigation.ts
15. use-persisted-sub-tasks.ts
16. use-ticket-form.ts
17. use-debounced-callback.ts

✅ Key hooks are documented in detail (use-local-storage, use-projects, use-ticket-form, use-dialog-auto-save, use-focus-management)

### 5. Features

✅ **All major features documented**:
- Task System (dashboard/tasks) - Documented
- Insights (analytics dashboard) - Documented
- File Management (dashboard/files) - Documented
- Authentication - Documented

✅ **All major routes documented**:
- `/(auth)/sign-in` - Documented
- `/(auth)/sign-up` - Documented
- `/(protected)/dashboard` - Documented
- `/insights` - Documented

---

## Suggested Updates

### Update CLAUDE.md Line 92: Custom Hooks Count

```diff
-hooks/               # Custom React hooks (18+)
+hooks/               # Custom React hooks (17 total)
```

### Add to CLAUDE.md Line 69: Project Structure - app/ section

```diff
   insights/         # Analytics dashboard
+  fonts/            # Custom font files (Inter, Instrument Serif)
+  auth/
+     callback/      # Supabase auth callback route
   _actions/         # Server actions for data mutations
```

### Add to CLAUDE.md Line 137: After docs/ in Project Structure

```diff
 docs/                # Project documentation
+
+icons/               # SVG icon assets
+public/              # Static assets (images, favicon, etc.)
+plans/               # Planning and design documents (not part of runtime)
+features/            # (Reserved for future feature modules)
```

---

## Action Items

1. [ ] Update custom hooks count from "18+" to "17 total" (CLAUDE.md line 92)
2. [ ] Add `app/fonts/` and `app/auth/callback/` to Project Structure
3. [ ] Document `icons/` and `public/` directories in Project Structure
4. [ ] Consider adding `plans/` and `features/` directories with notes about their purpose

---

## Recent Changes Log

- [2025-01-13 14:30:00] Initial health.md created
- [2025-01-13 14:30:00] Reorganized .claude directory structure per official Claude Code docs
- [2025-01-13 14:30:00] Updated CLAUDE.md with current codebase state
- [2025-01-13 14:50:00] Ran sync-docs, found 7 minor discrepancies (directory documentation, hooks count)

---

## Next Sync Recommendation

Run `/sync-docs` again after:
- Adding new features or major routes
- Installing new dependencies
- Restructuring directories
- Adding 3+ new hooks

**Estimated next sync**: After next major feature ship

---

## Status History

| Date | Status | Discrepancies | Notes |
|------|--------|---------------|-------|
| 2025-01-13 14:50 | NEEDS_UPDATE | 7 | Minor directory docs missing, hooks count off by 1 |
| 2025-01-13 14:30 | HEALTHY | 0 | Initial baseline after CLAUDE.md refresh |
