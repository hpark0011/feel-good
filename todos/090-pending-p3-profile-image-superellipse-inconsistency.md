---
status: pending
priority: p3
issue_id: "090"
tags: [code-review, consistency, mirror]
dependencies: []
---

# ProfileImage Uses Inline Style for Superellipse Instead of Tailwind Pattern

## Problem Statement

`ProfileImage` uses `style={{ cornerShape: "superellipse(1.2)" } as React.CSSProperties}` but the established codebase pattern (dock-icon, tooltip) uses Tailwind's arbitrary property syntax: `[corner-shape:superellipse(1.1)]`. Additionally, the component is missing a `rounded-*` fallback for browsers that don't support `corner-shape`.

The component is also named `ProfileImage` but renders a `<video>` element.

## Findings

- **Source:** pattern-recognition-specialist, kieran-typescript-reviewer agents
- **Location:** `apps/mirror/app/(protected)/dashboard/_components/profile-image.tsx` line 5
- **Evidence:** `packages/features/dock/components/dock-icon.tsx` line 21 uses `"[corner-shape:superellipse(1.1)] rounded-[12px]"`. `packages/ui/src/primitives/tooltip.tsx` line 52 uses same pattern.

## Proposed Solutions

### Option A: Use Tailwind arbitrary property + fallback (Recommended)
```typescript
className="relative w-[200px] h-[200px] rounded-t-full overflow-hidden [corner-shape:superellipse(1.2)]"
```
- Remove the `style` prop and `React.CSSProperties` cast
- Add `rounded-t-full` (or appropriate) as fallback
- Consider renaming component to `ProfileAvatar` or `ProfileMedia`
- **Effort:** Small
- **Risk:** None

## Acceptance Criteria

- [ ] Superellipse uses Tailwind arbitrary property syntax
- [ ] Fallback `rounded-*` class present
- [ ] No inline `style` prop for this
- [ ] Component name reflects video content

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-08 | Created from PR #105 code review | Use Tailwind arbitrary properties over inline styles |

## Resources

- PR: https://github.com/hpark0011/feel-good/pull/105
