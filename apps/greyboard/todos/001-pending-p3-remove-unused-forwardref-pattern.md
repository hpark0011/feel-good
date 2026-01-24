---
status: pending
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

## Findings

**Evidence:**
- Search for `ref={` usage on icons returns 0 results
- Each icon component uses ~19 lines with forwardRef pattern
- Simple function components would need ~9 lines each

**Current pattern:**
```tsx
import { forwardRef, type SVGProps } from "react";

export const CheckmarkIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(
  ({ className, ...props }, ref) => (
    <svg ref={ref} viewBox="0 0 28 28" ... />
  )
);
CheckmarkIcon.displayName = "CheckmarkIcon";
```

**Simpler pattern:**
```tsx
import type { SVGProps } from "react";

export function CheckmarkIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 28 28" className={className} {...props} />;
}
```

## Proposed Solutions

### Option 1: Update Conversion Script (Recommended)
- Modify `packages/icons/scripts/convert-svgs.ts` to generate simple function components
- Re-run conversion to regenerate all icons
- **Pros:** One-time fix, consistent pattern, ~1,670 LOC reduction
- **Cons:** Loses ref capability if needed in future
- **Effort:** Medium
- **Risk:** Low (refs not currently used)

### Option 2: Keep forwardRef for Future-Proofing
- Leave as-is for potential future ref usage
- **Pros:** Ready for future use cases
- **Cons:** YAGNI violation, added complexity
- **Effort:** None
- **Risk:** None

## Recommended Action

_(To be filled during triage)_

## Technical Details

**Affected files:**
- `packages/icons/scripts/convert-svgs.ts` (modify template)
- `packages/icons/src/components/*.tsx` (167 files regenerated)

## Acceptance Criteria

- [ ] Conversion script generates simple function components
- [ ] All 167 icon files regenerated
- [ ] Build succeeds
- [ ] No runtime errors

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|

## Resources

- Conversion script: `packages/icons/scripts/convert-svgs.ts`
- React docs on forwardRef: https://react.dev/reference/react/forwardRef
