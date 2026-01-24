---
status: pending
priority: p2
issue_id: "005"
tags:
  - code-review
  - icons
  - theming
dependencies: []
---

# Replace Hardcoded Colors in Icons with currentColor

## Problem Statement

55 icon components have hardcoded fill colors (e.g., `#C7C7CC`, `#1C1C1E`, `#6d55ff`) instead of using `currentColor`. This prevents proper theming and dark mode support.

## Findings

**Hardcoded colors found:**
| Color | Count | Example Icons |
|-------|-------|---------------|
| `#C7C7CC` | 55 | Various secondary elements |
| `#1C1C1E` | 2 | LogoIcon |
| `#6d55ff` | 1 | PencilCircleFillIcon |
| `#cccccc` | 4 | Doc-icons |
| `#DBDBDB` | 4 | Doc-icons |

**Example issue:**
```tsx
// packages/icons/src/components/logo.tsx
<path d="..." fill="#1C1C1E"/>  // Won't work in dark mode
```

## Proposed Solutions

### Option 1: Replace with currentColor (Recommended)
- Update conversion script to replace hardcoded colors with `currentColor`
- Regenerate all icons
- **Pros:** Full theme support, consistent behavior
- **Cons:** Some icons may need explicit color props
- **Effort:** Medium
- **Risk:** Low (visual testing needed)

### Option 2: Add Color Props
- Add `primaryColor` and `secondaryColor` props to icons
- Keep hardcoded colors as defaults
- **Pros:** Maximum flexibility
- **Cons:** More complex API
- **Effort:** High
- **Risk:** Medium

### Option 3: Use CSS Variables
- Replace hardcoded colors with CSS custom properties
- **Pros:** Theme-aware, fallback support
- **Cons:** Requires CSS variable setup
- **Effort:** Medium
- **Risk:** Low

## Recommended Action

_(To be filled during triage)_

## Technical Details

**Affected files:**
- `packages/icons/scripts/convert-svgs.ts` - Add color replacement logic
- ~55 icon component files - Regenerate

**Pattern to add to conversion script:**
```typescript
// Replace common hardcoded colors with currentColor
const colorReplacements: Record<string, string> = {
  '#C7C7CC': 'currentColor',
  '#1C1C1E': 'currentColor',
  '#6d55ff': 'currentColor',
};
```

## Acceptance Criteria

- [ ] No hardcoded fill colors in generated icons
- [ ] Icons work in both light and dark themes
- [ ] Visual regression testing passes

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|

## Resources

- Conversion script: `packages/icons/scripts/convert-svgs.ts`
- Related: Tailwind theming docs
