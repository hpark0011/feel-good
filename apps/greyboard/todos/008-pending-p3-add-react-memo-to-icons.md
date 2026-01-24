---
status: pending
priority: p3
issue_id: "008"
tags:
  - code-review
  - icons
  - performance
dependencies:
  - "001"
---

# Add React.memo to Icon Components

## Problem Statement

Icon components are not memoized, which can cause unnecessary re-renders when parent components update but icon props remain unchanged. This is particularly relevant for icons in frequently-updating contexts.

## Findings

**Current pattern:**
```typescript
export const CheckmarkIcon = forwardRef<...>((props, ref) => <svg ... />);
```

**Improved pattern:**
```typescript
export const CheckmarkIcon = memo(
  forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>((props, ref) => (
    <svg ... />
  ))
);
```

**Note:** If removing forwardRef (see todo #001), can use simpler pattern:
```typescript
export const CheckmarkIcon = memo(function CheckmarkIcon(props: SVGProps<SVGSVGElement>) {
  return <svg ... />;
});
```

## Proposed Solutions

### Option 1: Add memo to All Icons (Recommended)
- Update conversion script to wrap components in React.memo
- Regenerate all icons
- **Pros:** Prevents unnecessary re-renders
- **Cons:** Slight memory overhead for memo cache
- **Effort:** Small
- **Risk:** Low

### Option 2: Selective Memoization
- Only memoize icons used in frequently-updating contexts
- **Pros:** Targeted optimization
- **Cons:** Inconsistent patterns, harder to maintain
- **Effort:** Medium
- **Risk:** Low

### Option 3: No Memoization
- Keep icons unmemoized
- **Pros:** Simpler code
- **Cons:** May cause performance issues
- **Effort:** None
- **Risk:** Low

## Recommended Action

_(To be filled during triage)_

## Technical Details

**Affected files:**
- `packages/icons/scripts/convert-svgs.ts` - Update template
- All 167 icon files - Regenerate

## Acceptance Criteria

- [ ] Conversion script generates memoized components
- [ ] All icons regenerated
- [ ] No performance regressions

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|

## Resources

- React.memo docs: https://react.dev/reference/react/memo
- Related: todo #001 (remove forwardRef)
