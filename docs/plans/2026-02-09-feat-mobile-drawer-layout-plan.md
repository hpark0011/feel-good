---
title: "feat: Mobile drawer layout for dashboard"
type: feat
date: 2026-02-09
---

# Mobile Drawer Layout for Dashboard

## Overview

Add a mobile-responsive layout to the mirror dashboard page where the `ArticleListView` acts as a bottom sheet drawer that slides over the `ProfileInfoView`. As the drawer opens, the profile scales down to 80%. The drawer supports nested scrolling — once fully open, scrolling continues within the article list; scrolling back to the top dismisses the drawer.

## Problem Statement

The dashboard currently uses a fixed two-column `flex h-screen` layout with no responsive breakpoints. On mobile viewports, the side-by-side layout is unusable — the profile column and article column compete for ~375px of horizontal space.

## Proposed Solution

Use a **custom scroll-driven sheet component** instead of the existing Vaul drawer primitive. Rationale:

| Consideration | Vaul Drawer | Custom Scroll-Driven Sheet |
|---|---|---|
| Scale targeting | Scales entire `[vaul-drawer-wrapper]` | Scales only ProfileInfoView |
| Open trigger | Click/tap/drag on handle | Natural page scroll |
| Overlay | Default dark overlay (`bg-black/50`) | No overlay — profile visible beneath |
| Semantics | `role="dialog"`, focus trap | `role="region"`, no focus trap |
| Portal | Renders outside DOM flow | Inline, same DOM tree |
| IntersectionObserver | Breaks (viewport root mismatch) | Works with container ref |
| Bundle | Already installed (0 cost) | 0 dependencies |

Vaul's `shouldScaleBackground` is designed for the Apple-style modal sheet where the *entire* background scales. Our spec requires only the ProfileInfoView to scale while the drawer remains inline (not modal). A custom component provides exact control with less workaround code than overriding Vaul's modal behavior.

### Architecture

```
dashboard/page.tsx (responsive switch)
├── Desktop (>= md): existing flex layout (no changes)
└── Mobile (< md): MobileProfileLayout
    ├── _hooks/use-bottom-sheet.ts     ← gesture/scroll state machine
    ├── _views/mobile-profile-layout.tsx ← layout composition
    └── _components/sheet-container.tsx  ← styled sheet wrapper
```

**Separation of concerns:**
- **Hook** (`useBottomSheet`): All state and gesture logic — progress value, snap points, pointer events, scroll delegation
- **Layout** (`MobileProfileLayout`): Composes ProfileInfoView + sheet container, passes progress to CSS variables
- **Container** (`SheetContainer`): Styled wrapper with drag handle, rounded corners, scroll containment

## Technical Approach

### 1. Responsive Layout Switch

**File:** `apps/mirror/app/(protected)/dashboard/page.tsx`

Add a `useMediaQuery("(max-width: 767px)")` hook to conditionally render the mobile layout. The hook does not exist yet — create it in `@feel-good/ui/hooks/use-media-query`.

```tsx
// Simplified structure
if (isMobile) {
  return (
    <MobileProfileLayout
      profile={<ProfileInfoView />}
      content={<ArticleListView articles={articles} hasMore={hasMore} onLoadMore={loadMore} />}
    />
  );
}

// Desktop: existing layout unchanged
return (
  <main className="flex h-screen gap-4">
    <ProfileInfoView />
    <div className="flex-1 min-w-0 overflow-y-auto py-12 pb-[200px]">
      <ArticleListView ... />
    </div>
  </main>
);
```

**Breakpoint:** `md` (768px). Below this, mobile drawer layout activates. This is the standard tablet/mobile boundary and gives the two-column desktop layout adequate horizontal space.

### 2. Bottom Sheet Hook

**File:** `apps/mirror/app/(protected)/dashboard/_hooks/use-bottom-sheet.ts`

Core state machine managing a single `progress` value (0 = collapsed/peek, 1 = fully expanded):

**Snap points:** `[0.15, 1.0]`
- `0.15` = peek state — shows drag handle + table header + ~2 article rows
- `1.0` = fully open — article list fills the viewport

**State machine:**

```
IDLE (at snap point)
  → pointerdown on handle → DRAGGING
  → pointerdown on content, progress < 1 → DRAGGING
  → pointerdown on content, progress === 1, scrollTop > 0 → SCROLLING (pass-through)
  → pointerdown on content, progress === 1, scrollTop === 0, direction down → DRAGGING

DRAGGING
  → pointermove → update progress (clamped 0..1)
  → pointerup → snap to nearest (velocity-biased)

SCROLLING
  → scroll reaches top + continued pull-down after 100ms debounce → DRAGGING
```

**Outputs:**
- `progress: number` — 0 to 1, drives all visual transforms
- `sheetRef: RefObject<HTMLDivElement>` — for the scrollable content container
- `handleRef: RefObject<HTMLDivElement>` — drag handle target
- `isDragging: boolean` — disables CSS transitions during active drag
- `bgScale: number` — derived: `1 - progress * 0.2` (1.0 at peek → 0.8 at full)

**Performance:**
- During drag: update CSS custom properties via `element.style.setProperty()` directly, bypassing React re-renders
- On snap: apply CSS `transition: transform 300ms cubic-bezier(0.32, 0.72, 0, 1)` for the spring-to-snap animation
- Use `{ passive: true }` for pointermove listeners where possible
- `will-change: transform` only during active drag (remove after snap)

### 3. Mobile Profile Layout

**File:** `apps/mirror/app/(protected)/dashboard/_views/mobile-profile-layout.tsx`

```tsx
interface MobileProfileLayoutProps {
  profile: React.ReactNode;
  content: React.ReactNode;
}
```

**Structure:**

```
<div className="h-screen overflow-hidden relative">
  {/* Background layer — scales with progress */}
  <div
    className="absolute inset-0 origin-center transition-transform"
    style={{ transform: `scale(${bgScale})` }}
  >
    {profile}
  </div>

  {/* Sheet layer — translates up with progress */}
  <SheetContainer
    ref={sheetRef}
    handleRef={handleRef}
    isDragging={isDragging}
    style={{ transform: `translateY(${(1 - progress) * 85}%)` }}
  >
    {content}
  </SheetContainer>
</div>
```

The profile layer is `absolute inset-0` so it fills the viewport. The sheet is positioned on top and slides up via `translateY`. Both use compositor-only `transform` properties for 60fps performance.

### 4. Sheet Container

**File:** `apps/mirror/app/(protected)/dashboard/_components/sheet-container.tsx`

```tsx
interface SheetContainerProps {
  children: React.ReactNode;
  handleRef: React.RefObject<HTMLDivElement>;
  isDragging: boolean;
  style: React.CSSProperties;
}
```

**Visual treatment:**
- Rounded top corners: `rounded-t-2xl`
- Background: `bg-background`
- Drag handle: `w-12 h-1.5 rounded-full bg-muted-foreground/20 mx-auto mt-3 mb-2`
- Inner scroll: `overflow-y-auto overscroll-y-contain`
- No overlay/scrim — profile remains visible through the gap

### 5. IntersectionObserver Fix

**File:** `apps/mirror/app/(protected)/dashboard/articles/_components/article-list-loader.tsx`

The current `IntersectionObserver` uses the viewport as `root`. When inside a scroll container (the sheet), it must reference that container instead.

**Change:** Accept an optional `scrollContainerRef` prop. Pass it as the `root` option:

```tsx
type ArticleListLoaderProps = {
  hasMore: boolean;
  onLoadMore: () => void;
  scrollContainerRef?: React.RefObject<HTMLElement>;
};

// In the observer setup:
const observer = new IntersectionObserver(
  ([entry]) => { if (entry.isIntersecting) onLoadMore(); },
  { rootMargin: "200px", root: scrollContainerRef?.current ?? null }
);
```

On desktop, `scrollContainerRef` is undefined → viewport root (existing behavior).
On mobile, the sheet's scrollable div ref is passed → correct container root.

### 6. `useMediaQuery` Hook

**File:** `packages/ui/src/hooks/use-media-query.ts`

Minimal hook using `window.matchMedia`:

```tsx
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
```

Add to `packages/ui/package.json` exports: `"./hooks/use-media-query"`.

## Acceptance Criteria

### Functional Requirements

- [ ] On viewports < 768px, dashboard renders ProfileInfoView full-screen with ArticleListView as a bottom sheet at peek position
- [ ] Dragging the sheet handle up opens the sheet; ProfileInfoView scales from 100% to 80%
- [ ] At full open, scrolling within the sheet scrolls the article list
- [ ] At full open, scrolling article list to top then pulling down closes the sheet (with 100ms debounce)
- [ ] Sheet snaps to peek (15%) or fully open (100%) positions on release, with velocity-biased snap selection
- [ ] Infinite scroll works inside the mobile sheet (IntersectionObserver uses container root)
- [ ] Article row taps navigate correctly (no conflict with drag gestures)
- [ ] On viewports >= 768px, existing two-column layout is unchanged

### Non-Functional Requirements

- [ ] All animations use `transform` and `opacity` only (compositor-thread, no layout triggers)
- [ ] During active drag, CSS transitions are disabled for immediate response
- [ ] `prefers-reduced-motion: reduce` → instant transitions, no scale animation
- [ ] `overscroll-behavior-y: contain` on sheet content prevents scroll chaining to body

### Quality Gates

- [ ] `pnpm build --filter=@feel-good/mirror` passes
- [ ] `pnpm lint --filter=@feel-good/mirror` passes
- [ ] Test on Chrome mobile emulator (iPhone SE, iPhone 14 Pro Max, Pixel 7)
- [ ] Verify video element renders without artifacts during scale transform on Chrome mobile emulator

## Implementation Phases

### Phase 1: Foundation (hooks + responsive switch)

**Files:**
- `packages/ui/src/hooks/use-media-query.ts` — new hook
- `packages/ui/package.json` — add export
- `apps/mirror/app/(protected)/dashboard/page.tsx` — add responsive conditional

**Deliverable:** Desktop layout unchanged; mobile renders a placeholder indicating the mobile layout position.

### Phase 2: Sheet UI (container + layout)

**Files:**
- `apps/mirror/app/(protected)/dashboard/_components/sheet-container.tsx` — new component
- `apps/mirror/app/(protected)/dashboard/_views/mobile-profile-layout.tsx` — new layout view

**Deliverable:** Static mobile layout with profile background + sheet foreground at fixed position (no gestures yet).

### Phase 3: Gesture Logic (hook + integration)

**Files:**
- `apps/mirror/app/(protected)/dashboard/_hooks/use-bottom-sheet.ts` — new hook
- `apps/mirror/app/(protected)/dashboard/_views/mobile-profile-layout.tsx` — wire up hook

**Deliverable:** Fully interactive — drag to open/close, snap points, scale transform, transition between drag and scroll.

### Phase 4: Infinite Scroll Fix

**Files:**
- `apps/mirror/app/(protected)/dashboard/articles/_components/article-list-loader.tsx` — accept `scrollContainerRef` prop
- `apps/mirror/app/(protected)/dashboard/articles/_views/article-list-view.tsx` — pass ref through
- `apps/mirror/app/(protected)/dashboard/_views/mobile-profile-layout.tsx` — pass sheet scroll ref

**Deliverable:** Infinite scroll works inside the mobile sheet.

### Phase 5: Polish

- [ ] `prefers-reduced-motion` support
- [ ] Verify video element behavior under scale
- [ ] Touch target sizing audit (article rows need >= 44px height on mobile)
- [ ] DashboardHeader z-index: ensure header remains above sheet or is hidden on mobile

## Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Vaul vs. custom | Custom | Vaul's modal paradigm (portal, overlay, focus trap, full-background scale) requires more overrides than building from scratch |
| Breakpoint | `md` (768px) | Standard tablet/mobile boundary; two-column layout needs ~768px minimum |
| Snap points | `[0.15, 1.0]` | Two points keeps interaction simple; 15% peek shows header + 2-3 rows |
| Animation approach | CSS custom properties + transforms | GPU-composited, zero library overhead, direct style manipulation during drag |
| Scale value | 80% (0.8) | Per spec requirement |
| Scroll delegation | 100ms debounce at scrollTop=0 | Prevents false-trigger when scroll momentum overshoots the top |

## Open Questions

1. **Video pause on scale?** Should the portrait video in ProfileImage pause when the profile is scaled to 80%? Saves resources but loses the "living profile" feel.
2. **Landscape mobile?** Profile may fill entire viewport in landscape (~320px height). Consider skipping drawer in landscape or showing a compact profile.
3. **Navigation state?** When user taps an article, navigates to detail page, then presses back — should drawer state and scroll position be preserved? (MVP: no, future improvement)
4. **Table columns on mobile?** Currently 3 columns (60/20/20). Consider hiding "Category" column on mobile for better readability.

## References

### Internal
- Dashboard page: `apps/mirror/app/(protected)/dashboard/page.tsx`
- ProfileInfoView: `apps/mirror/app/(protected)/dashboard/_views/profile-info-view.tsx`
- ArticleListView: `apps/mirror/app/(protected)/dashboard/articles/_views/article-list-view.tsx`
- ArticleListLoader: `apps/mirror/app/(protected)/dashboard/articles/_components/article-list-loader.tsx`
- Vaul drawer primitive: `packages/ui/src/primitives/drawer.tsx`
- Dock auto-hide pattern: `packages/features/dock/README.md`
- Passive event listeners rule: `.claude/skills/vercel-react-best-practices/rules/client-passive-event-listeners.md`
- Transition performance rule: `.claude/skills/vercel-react-best-practices/rules/rerender-transitions.md`

### External
- Vaul documentation: https://vaul.emilkowal.ski/
- `overscroll-behavior` MDN: https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior
- Bottom sheet UX guidelines (NN/g): https://www.nngroup.com/articles/bottom-sheet/
