---
paths:
  - "apps/mirror/hooks/use-profile-navigation-effects.ts"
  - "apps/mirror/app/[username]/**"
---

# Mirror Navigation — Scroll Memory

## Architecture

Profile routes (`/@username`, `/@username/slug`) preserve scroll position across forward/back navigation.

### How it works

1. `useProfileNavigationEffects` detects forward/back navigation via pathname changes
2. On **forward** (list → detail): saves scroll position, scrolls to top
3. On **back** (detail → list): restores saved scroll position
4. Active scroll container is tracked via refs (mobile or desktop layout)

### Key file

`apps/mirror/hooks/use-profile-navigation-effects.ts` — the single hook that owns scroll memory. Uses a local `isArticleDetailRoute` helper to detect navigation direction.
