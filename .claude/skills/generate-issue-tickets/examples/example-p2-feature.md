<!-- File location: workspace/tickets/to-do/FG_014-p2-dock-keyboard-navigation.md -->
---
id: FG_014
title: "Dock items navigable via keyboard arrow keys"
date: 2026-02-20
type: feature
status: to-do
priority: p2
description: "The AppDock component only supports mouse interaction. Users who rely on keyboard navigation cannot move focus between dock items using arrow keys, which blocks accessibility compliance and power-user workflows."
dependencies: []
parent_plan_id:
acceptance_criteria:
  - "`grep -rn 'onKeyDown\\|onKeyUp\\|handleKey' packages/features/dock/` returns at least one match in the dock item component"
  - "Arrow left/right moves `aria-activedescendant` or `document.activeElement` between dock items — verifiable via Playwright `page.keyboard.press('ArrowRight')` followed by `page.locator('[data-dock-item]:focus').getAttribute('data-index')`"
  - "`grep -n 'role=\"toolbar\"\\|role=\"listbox\"' packages/features/dock/` returns at least one match (proper ARIA role)"
  - "Home key focuses first item; End key focuses last item — `grep -n 'Home\\|End' packages/features/dock/` returns matches"
  - "`pnpm build --filter=@feel-good/mirror` exits 0"
owner_agent: "Accessibility Feature Agent"
---

# Dock Items Navigable via Keyboard Arrow Keys

## Context

The `AppDock` component (`packages/features/dock/blocks/app-dock.tsx`) renders a horizontal row of app shortcuts but has no keyboard interaction handlers. Focus management is entirely mouse-driven — clicking an item focuses it, but there is no way to move between items using the keyboard.

- **Source:** Accessibility audit of shared components
- **Location:** `packages/features/dock/blocks/app-dock.tsx`
- **Evidence:** No `onKeyDown` handler on dock item elements. Tab key skips the entire dock row because items are not in the tab order.

## Goal

Dock items are navigable via arrow keys (left/right), Home, and End, following the WAI-ARIA toolbar pattern. Focus is visually indicated and screen readers announce the active item.

## Scope

- Add `onKeyDown` handler to dock item container with ArrowLeft, ArrowRight, Home, End support
- Implement roving tabindex pattern (`tabIndex={0}` on active, `tabIndex={-1}` on rest)
- Add `role="toolbar"` to the dock container and `role="button"` to individual items
- Add visible focus ring styles

## Out of Scope

- Drag-and-drop reordering of dock items (separate ticket)
- Dock item tooltips or labels (separate ticket)
- Mobile touch gesture support

## Approach

Implement the roving tabindex pattern. The dock container gets `role="toolbar"` and manages a single roving `tabIndex={0}` across its children. Arrow keys shift the active index and call `.focus()` on the target element.

```typescript
const handleKeyDown = (e: React.KeyboardEvent) => {
  const items = containerRef.current?.querySelectorAll("[data-dock-item]");
  if (!items?.length) return;

  let next = activeIndex;
  if (e.key === "ArrowRight") next = (activeIndex + 1) % items.length;
  if (e.key === "ArrowLeft") next = (activeIndex - 1 + items.length) % items.length;
  if (e.key === "Home") next = 0;
  if (e.key === "End") next = items.length - 1;

  if (next !== activeIndex) {
    setActiveIndex(next);
    (items[next] as HTMLElement).focus();
    e.preventDefault();
  }
};
```

- **Effort:** Small
- **Risk:** Low

## Implementation Steps

1. Add `role="toolbar"` to the dock container element in `packages/features/dock/blocks/app-dock.tsx`
2. Add `data-dock-item` attribute and `role="button"` to each dock item element
3. Create a `useRovingTabIndex` hook or inline state to track `activeIndex` with `useState(0)`
4. Add `onKeyDown` handler to the container that handles `ArrowLeft`, `ArrowRight`, `Home`, `End` keys
5. Set `tabIndex={0}` on the active item and `tabIndex={-1}` on all others
6. Add visible focus ring styles (e.g., `focus-visible:ring-2`) to dock items
7. Run `pnpm build --filter=@feel-good/mirror` to verify no build errors

## Constraints

- Must not change existing click behavior or visual appearance (beyond adding focus ring)
- Must follow WAI-ARIA toolbar pattern — do not invent custom keyboard semantics

## Resources

- WAI-ARIA Toolbar Pattern: https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/
