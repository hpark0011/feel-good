---
status: completed
priority: p3
issue_id: "001"
tags:
  - code-review
  - icons
  - simplification
dependencies: []
---

# Remove Unused forwardRef Pattern from Icon Components

## Problem Statement

All 167 icon components use the `forwardRef` pattern, but no icons in the codebase actually receive refs. This adds unnecessary complexity and ~1,670 lines of code that could be simplified.

## Resolution

**Applied Option 1: Updated conversion script and transformed all components**

All 165 icon components have been converted from `forwardRef` to simple function components.

### Changes Made

1. **`packages/icons/scripts/convert-svgs.ts`** - Updated template to generate simple function components
2. **`packages/icons/scripts/simplify-components.ts`** - New one-time script to transform existing components
3. **`packages/icons/src/components/*.tsx`** - 161 files transformed
4. **`packages/icons/src/doc-icons/*.tsx`** - 4 files transformed

### Before/After

**Before (~19 lines per icon):**
```tsx
import { forwardRef, type SVGProps } from "react";

export const CheckmarkIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  ({ className, ...props }, ref) => (
    <svg ref={ref} viewBox="0 0 28 28" ... />
  )
);
CheckmarkIcon.displayName = "CheckmarkIcon";
```

**After (~15 lines per icon):**
```tsx
import type { SVGProps } from "react";

export function CheckmarkIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 28 28" className={className} {...props}>
      ...
    </svg>
  );
}
```

### Results

| Metric | Value |
|--------|-------|
| Files transformed | 165 |
| Lines saved per icon | ~4 |
| Total lines saved | ~660 |
| New total lines | ~2,475 |

## Acceptance Criteria

- [x] Conversion script generates simple function components
- [x] All 165 icon files transformed
- [x] Build succeeds
- [x] No runtime errors (TypeScript passes)

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2025-01-24 | Updated convert-svgs.ts template, created simplify-components.ts, transformed 165 files | Source SVGs no longer available so created transformation script for existing files. Actual line savings ~660 (not ~1,670 as estimated - the 9-line simple pattern estimate was too aggressive) |

## Resources

- Conversion script: `packages/icons/scripts/convert-svgs.ts`
- Simplify script: `packages/icons/scripts/simplify-components.ts`
- React docs on forwardRef: https://react.dev/reference/react/forwardRef
