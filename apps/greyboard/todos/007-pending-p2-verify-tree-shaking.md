---
status: completed
priority: p2
issue_id: "007"
tags:
  - code-review
  - icons
  - performance
  - bundle-size
dependencies: []
---

# Verify Tree-Shaking is Working for Icon Package

## Problem Statement

Without verification, the entire 165-icon library (~250-400KB) could be bundled instead of just the ~22 icons actually used. This is a critical performance concern.

## Resolution

**Tree-shaking is working correctly.**

### Bundle Analysis Results (2025-01-24)

| Metric | Value |
|--------|-------|
| Icons in package | 165 |
| Icons actually used | 32 |
| Icon chunk size | 24KB |
| Expected if no tree-shaking | ~250-400KB |

**Key findings:**
- `@feel-good/icons` content is isolated in chunk `439-1522eaf34e833fe5.js` (24KB)
- Only used icons appear in the bundle (verified by checking SVG paths)
- `sideEffects: false` in package.json is working correctly
- `transpilePackages` configuration does NOT prevent tree-shaking

### Icons Used

The 32 icons imported from `@feel-good/icons`:
- ArrowDownToLineCompactIcon, ArrowUpToLineCompactIcon
- CalendarFillIcon, CheckedCircleFillIcon, ChecklistIcon, CheckmarkSmallIcon
- ChevronDownIcon, CircleDashedIcon, CircleLeftHalfFilledIcon
- CircleLeftHalfFilledRightHalfStripedHorizontalIcon, CylinderSplit1x2FillIcon
- EllipsisIcon, ExclamationmarkTriangleFillIcon, FolderFillIcon
- HandWaveFillIcon, InfoCircleFillIcon, InfoCircleIcon, Line3Icon
- PauseFillIcon, PencilIcon, PlayFillIcon, PlusCircleFillIcon, PlusIcon
- SquareStackFillIcon, SquareTextSquareFillIcon, TargetIcon
- TrashFillIcon, TrashIcon, TriangleFillDownIcon
- WaveformPathEcgIcon, XmarkCircleFillIcon, XmarkIcon

## Changes Made

1. **Installed `@next/bundle-analyzer`** as dev dependency
2. **Updated `next.config.ts`** with bundle analyzer wrapper
3. **Added `analyze` script** to package.json: `ANALYZE=true next build`

### Run Analysis

```bash
pnpm --filter @feel-good/greyboard analyze
```

This opens three HTML reports in browser:
- `.next/analyze/client.html` - Client bundle (main focus)
- `.next/analyze/nodejs.html` - Server bundle
- `.next/analyze/edge.html` - Edge runtime bundle

## Acceptance Criteria

- [x] Bundle analyzer installed and configured
- [x] Analysis run confirms tree-shaking works
- [x] Icon bundle size < 50KB (actual: 24KB)

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2025-01-24 | Installed @next/bundle-analyzer, ran analysis | Tree-shaking works correctly with barrel exports when sideEffects:false is set. 32 icons used, bundle is 24KB. |

## Resources

- Bundle analyzer: https://www.npmjs.com/package/@next/bundle-analyzer
- Next.js docs: https://nextjs.org/docs/app/building-your-application/optimizing/bundle-analyzer
