# Comprehensive Validation Command

Run all validation phases sequentially. Stop and report if any phase fails.

## Phase 1: Linting

Run ESLint with Next.js configuration to check for code quality issues:

```bash
pnpm lint
```

**Success criteria**: Exit code 0, no errors reported.

## Phase 2: Type Checking

Run TypeScript compiler in strict mode to verify type safety:

```bash
npx tsc --noEmit
```

**Success criteria**: Exit code 0, no type errors.

## Phase 3: Production Build

Run Next.js production build to catch build-time errors, bundle issues, and ensure all pages compile:

```bash
pnpm build
```

**Success criteria**: Exit code 0, build completes successfully.

## Phase 4: Visual Regression Testing (Manual Browser Verification)

Since this is a UI-focused analytics dashboard with no automated E2E tests configured, perform visual verification using the Playwright browser tools:

1. Start the dev server in background:
```bash
pnpm dev
```

2. Navigate to each critical route and verify:

### Route: /studio (Home Dashboard)
- Page loads without console errors
- "Good Afternoon, John!" greeting visible
- "Train your Delphi" section with training cards renders
- Mind Score widget displays correctly
- Analytics and Highlights sections render

### Route: /analytics/engagement
- Page loads and redirects properly
- Header with "Analytics" title visible
- Date range picker functional
- Tab navigation (Engagement, Audience, Highlights, Broadcasts) visible
- KPI cards render with metrics

### Route: /analytics/audience
- Page loads via tab navigation
- Audience-specific content renders

### Route: /analytics/highlights
- Page loads via tab navigation
- Highlights content renders

### Route: /analytics/broadcasts
- Page loads via tab navigation
- Broadcasts content renders

### Route: /onboarding
- Onboarding flow accessible
- Multi-step navigation works

### Route: /interview
- Interview page loads
- Topic sidebar renders
- Conversation display area visible

### Route: /profile
- Profile page accessible

### Route: /products
- Products page accessible

3. Theme Toggle Verification:
- Use Cmd+K to toggle between light and dark mode
- Verify colors transition correctly

4. Stop the dev server after verification.

## Phase 5: Component Import Verification

Verify all component imports are valid by checking for any circular dependencies or missing exports:

```bash
npx tsc --noEmit --traceResolution 2>&1 | grep -i "error" || echo "No import errors found"
```

## Validation Report

After completing all phases, provide a summary:

- **Phase 1 (Linting)**: PASS/FAIL
- **Phase 2 (Type Checking)**: PASS/FAIL
- **Phase 3 (Production Build)**: PASS/FAIL
- **Phase 4 (Visual Verification)**: PASS/FAIL with notes
- **Phase 5 (Import Verification)**: PASS/FAIL

If all phases pass, the codebase is validated and ready for deployment.
