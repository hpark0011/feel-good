---
status: pending
priority: p3
issue_id: "003"
tags:
  - code-review
  - icons
  - dead-code
dependencies: []
---

# Remove Unused IconProps Interface

## Problem Statement

The `IconProps` interface is defined in `types.ts` but generated icon components use `SVGProps<SVGSVGElement>` directly. This is a redundant abstraction.

## Findings

**Type definition in `packages/icons/src/types.ts`:**
```typescript
export interface IconProps extends SVGProps<SVGSVGElement> {
  className?: string;
}
```

**Generated components use:**
```typescript
export const CheckmarkIcon = forwardRef<SVGSVGElement, SVGProps<SVGSVGElement>>(...)
```

The `IconProps` interface adds nothing beyond `SVGProps<SVGSVGElement>` since `className` is already included in SVGProps.

## Proposed Solutions

### Option 1: Remove IconProps (Recommended)
- Remove IconProps from types.ts
- Remove export from index.ts
- **Pros:** Removes redundant abstraction
- **Cons:** Breaking change if external consumers use it
- **Effort:** Trivial
- **Risk:** Low (private package)

### Option 2: Use IconProps in Generated Components
- Update conversion script to use IconProps in generated components
- Provides consistent API
- **Pros:** Type consistency
- **Cons:** More work for same result
- **Effort:** Medium
- **Risk:** Low

## Recommended Action

_(To be filled during triage)_

## Technical Details

**Affected files:**
- `packages/icons/src/types.ts` - Remove IconProps interface
- `packages/icons/src/index.ts` - Remove IconProps export

## Acceptance Criteria

- [ ] IconProps interface removed
- [ ] Export removed from index.ts
- [ ] No TypeScript errors

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|

## Resources

- Types file: `packages/icons/src/types.ts`
