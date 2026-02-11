---
status: pending
priority: p1
issue_id: "122"
tags: [code-review, view-transitions, timing, mirror]
dependencies: []
---

# View transition timing race — direction attribute may be set after old snapshot capture

## Problem Statement

The `useNavDirection` hook sets `data-nav-direction` on `<html>` inside a `useLayoutEffect`. The View Transition API calls `document.startViewTransition(callback)`, which captures the "old" snapshot **before** the callback runs. Since React 19's `<ViewTransition>` triggers `startViewTransition` internally, the `useLayoutEffect` fires inside the callback (after old snapshot capture). This could mean the CSS direction attribute is one navigation behind — the old snapshot's animation uses the **previous** attribute value.

**Disputed:** The architecture and performance reviewers argue that CSS rules for `::view-transition-old/new` pseudo-elements are evaluated when animations start (after both snapshots and DOM updates), not at snapshot capture time. If true, `useLayoutEffect` timing is sufficient.

## Findings

- **Frontend Races Reviewer (P1):** `useLayoutEffect` fires inside the `startViewTransition` callback, after old snapshot capture. Direction attribute is always one step behind. First navigation would have no attribute set, causing browser default crossfade.
- **Architecture Reviewer (P3):** `useLayoutEffect` is correct — fires before paint, attribute is available when CSS is evaluated.
- **Performance Reviewer (P3):** `useLayoutEffect` is justified, no layout thrashing concern.

## Proposed Solutions

### Option A: Move attribute set to synchronous render (Frontend Races suggestion)

```ts
export function useNavDirection() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  if (pathname !== prevPathname.current) {
    const isForward = pathname.startsWith("/dashboard/articles/");
    document.documentElement.dataset.navDirection = isForward ? "forward" : "back";
    prevPathname.current = pathname;
  }
}
```

- **Pros:** Guarantees attribute is set before `startViewTransition()` is called
- **Cons:** DOM mutation during render is unconventional (though `<html>` is outside React's tree)
- **Effort:** Small
- **Risk:** Low

### Option B: Keep `useLayoutEffect`, verify with manual testing

- **Pros:** Follows React conventions, no render-phase side effects
- **Cons:** Relies on assumption about when CSS rules are evaluated
- **Effort:** Small (just testing)
- **Risk:** Low if testing confirms correct behavior

### Option C: Take manual control of `startViewTransition()`

Abandon React 19's `<ViewTransition>` component and call `document.startViewTransition()` manually, setting the attribute first.

- **Pros:** Full control over timing
- **Cons:** Loses React 19 integration, more complex code
- **Effort:** Medium
- **Risk:** Medium

## Recommended Action

Test manually first (Option B). Navigate list -> detail on dev server and verify the slide direction is correct on the **very first navigation**. If incorrect, apply Option A.

## Technical Details

- **Affected files:** `apps/mirror/app/(protected)/dashboard/_components/use-nav-direction.ts`
- **Related:** React 19 `<ViewTransition>` in `dashboard-shell.tsx`, CSS in `globals.css`

## Acceptance Criteria

- [ ] First forward navigation (list -> detail) slides correctly from right
- [ ] First back navigation (detail -> list) slides correctly to right
- [ ] Rapid forward/back navigation produces correct direction each time
- [ ] Browser back/forward buttons animate in correct direction

## Work Log

- 2026-02-11: Created from PR #113 code review. Disputed across reviewers — needs manual verification.

## Resources

- PR #113: https://github.com/hpark0011/feel-good/pull/113
- [View Transition API spec](https://drafts.csswg.org/css-view-transitions/)
