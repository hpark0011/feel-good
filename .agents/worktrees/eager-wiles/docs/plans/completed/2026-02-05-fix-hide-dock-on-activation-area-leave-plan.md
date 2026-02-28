---
title: "fix: Hide Dock When Leaving Activation Area"
type: fix
date: 2026-02-05
related_todos: ["034", "035"]
---

# fix: Hide Dock When Leaving Activation Area

## Overview

The dock stays visible after the cursor leaves the activation zone because `onMouseLeave` is not wired on the activation area div. This fix adds the missing leave handler and addresses a related timeout stacking bug that would cause incorrect behavior if left unfixed.

## Problem Statement

In `packages/features/dock/blocks/app-dock.tsx`, the activation zone (an invisible 72px-tall div at the bottom of the viewport) only has `onMouseEnter` bound. When the cursor enters the zone, `show()` fires and the dock slides in. But if the cursor then moves **sideways or upward** without entering the DockContainer, nothing triggers `hide()` — the dock remains visible indefinitely.

Additionally, the `hide()` function in `useDockVisibility` does not clear any existing timeout before scheduling a new one (Todo #035). This means if `hide()` is called twice, the first timeout becomes an orphan that `show()` cannot cancel — leading to the dock hiding unexpectedly even after a `show()` call.

## Proposed Solution

1. Add `onMouseLeave` to the activation zone div → calls `hide()` (300ms delayed)
2. Add `onMouseEnter` to `DockContainer` → calls `show()` (cancels pending hide timeout)
3. Fix `hide()` to clear any existing timeout before scheduling a new one
4. Add `useEffect` cleanup to clear timeout on unmount

This ensures:
- Leaving the activation zone schedules a hide
- Moving from the activation zone into the dock cancels the pending hide
- Orphaned timeouts cannot cause unexpected state changes

## Technical Considerations

### Spatial Overlap Between Sibling Elements

The activation zone (`absolute inset-x-0 bottom-0 h-[72px]`) and DockContainer (`fixed bottom-2`, ~8px from bottom) overlap spatially. They are **siblings**, not parent-child. The DockContainer renders after the activation zone in the DOM and has higher stacking order.

When the cursor moves from the activation zone into the visible dock:
1. `onMouseLeave` fires on the activation zone → `hide()` schedules a 300ms timeout
2. `onMouseEnter` fires on the DockContainer → `show()` cancels the timeout

The 300ms `hideDelay` provides enough grace period for this handoff. This pattern is standard for macOS-style dock interactions.

### Tooltip Interaction

`DockItem` tooltips use Radix UI portals, rendering outside the DockContainer DOM tree. Moving the cursor from a dock icon to its tooltip fires `onMouseLeave` on the DockContainer. The 300ms delay mitigates this for quick glances, but prolonged tooltip reading may cause the dock to hide. This is a pre-existing edge case — not introduced by this fix — and can be addressed separately.

### Event Ordering Verification

The fix relies on browser `mouseEnter`/`mouseLeave` event ordering between sibling elements. This should be manually tested to confirm the DockContainer's `onMouseEnter` fires before the 300ms hide timeout expires when the cursor transitions between the two elements.

## Acceptance Criteria

- [x] Leaving the activation zone schedules dock hide (300ms delay)
- [x] Dock remains visible when cursor moves from activation zone into dock
- [ ] Manual hover test shows dock slides out when cursor leaves activation zone sideways
- [ ] Manual hover test shows dock slides out when cursor leaves activation zone upward (missing dock)
- [x] `hide()` clears any existing timeout before scheduling a new one
- [x] Timeout is cleaned up on component unmount
- [x] TypeScript interfaces updated with new handler types
- [x] No regressions: dock still shows on activation zone enter, hides on dock leave

## Files to Change

### `packages/features/dock/hooks/use-dock-visibility.ts`

**Interface update** — Add new handlers to `DockVisibilityHandlers`:

```typescript
// use-dock-visibility.ts (lines 17-22)
export interface DockVisibilityHandlers {
  onActivationZoneEnter: () => void;
  onActivationZoneLeave: () => void;  // NEW
  onDockEnter: () => void;            // NEW
  onDockLeave: () => void;
}
```

**Fix `hide()` to clear existing timeout** — Prevent orphaned timeouts:

```typescript
// use-dock-visibility.ts — hide() function
const hide = useCallback(() => {
  if (hideTimeoutRef.current) {
    clearTimeout(hideTimeoutRef.current);
  }
  hideTimeoutRef.current = setTimeout(() => {
    setIsVisible(false);
    hideTimeoutRef.current = null;
  }, hideDelay);
}, [setIsVisible, hideDelay]);
```

**Add new handlers to returned object**:

```typescript
// use-dock-visibility.ts — handlers object
const handlers: DockVisibilityHandlers = useMemo(
  () => ({
    onActivationZoneEnter: show,
    onActivationZoneLeave: hide,
    onDockEnter: show,
    onDockLeave: hide,
  }),
  [show, hide]
);
```

**Add cleanup `useEffect`**:

```typescript
// use-dock-visibility.ts — cleanup on unmount
useEffect(() => {
  return () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
  };
}, []);
```

### `packages/features/dock/components/dock-container.tsx`

**Add `onMouseEnter` prop**:

```typescript
// dock-container.tsx — DockContainerProps interface
export interface DockContainerProps {
  children: ReactNode;
  isVisible?: boolean;
  className?: string;
  onMouseEnter?: () => void;  // NEW
  onMouseLeave?: () => void;
}
```

Wire `onMouseEnter` to the `<nav>` element alongside the existing `onMouseLeave`.

### `packages/features/dock/blocks/app-dock.tsx`

**Wire `onMouseLeave` on activation zone div**:

```tsx
// app-dock.tsx — activation zone div (line ~39)
<div
  className="absolute inset-x-0 bottom-0 h-[72px]"
  onMouseEnter={handlers.onActivationZoneEnter}
  onMouseLeave={handlers.onActivationZoneLeave}  // NEW
/>
```

**Wire `onMouseEnter` on DockContainer**:

```tsx
// app-dock.tsx — DockContainer (line ~42)
<DockContainer
  isVisible={isVisible}
  onMouseEnter={handlers.onDockEnter}    // NEW
  onMouseLeave={handlers.onDockLeave}
>
```

## Success Metrics

- The dock hides within ~500ms (300ms delay + 200ms animation) after the cursor leaves the activation zone without entering the dock
- No visual flicker when transitioning the cursor from the activation zone into the dock
- No console warnings about state updates on unmounted components

## Dependencies & Risks

**Dependencies:**
- None — this is a self-contained fix within the dock package

**Risks:**
- **Low:** Event ordering between sibling elements could vary across browsers — mitigated by the 300ms grace period
- **Low:** Tooltip portal interaction could cause premature hide — pre-existing issue, not introduced by this fix

## Related Issues

- **Todo #035** (`035-pending-p2-clear-dock-hide-timeout.md`): Timeout stacking bug in `hide()` — resolved as part of this fix
- **Todo #033** (`033-pending-p3-remove-unused-cn-import-in-dock-block.md`): Unused `cn` import in `app-dock.tsx` — can be cleaned up in the same PR
- **Future:** Keyboard accessibility for dock (WCAG 2.1.1) — separate issue
- **Future:** Touch device support for dock — separate issue

## References

- Affected file: `packages/features/dock/blocks/app-dock.tsx`
- Hook: `packages/features/dock/hooks/use-dock-visibility.ts`
- Component: `packages/features/dock/components/dock-container.tsx`
- Original plan: `docs/plans/2026-02-04-feat-app-dock-navigation-ui-plan.md`
