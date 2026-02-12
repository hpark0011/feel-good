---
status: pending
priority: p2
issue_id: "142"
tags: [code-review, quality, react, mirror]
dependencies: []
---

# Missing Timer Cleanup on Component Unmount

## Problem Statement

The `animationTimerRef` in `scrollable-article-list.tsx` is not cleaned up when the component unmounts. If the user changes sort order and navigates away within the 1-second window, the `setTimeout` callback fires on an unmounted component. While React 19 silently discards the update, the timer still holds a reference preventing garbage collection.

## Findings

**Affected File:**
- `apps/mirror/features/articles/components/scrollable-article-list.tsx` (lines 34-47)

**Current code:** Timer cleanup only happens on re-invocation of `handleSortChange` (line 40), not on unmount.

**Reference pattern:** Greyboard's `list-section.tsx` (lines 43-46) correctly uses `useEffect` return for timer cleanup:
```typescript
useEffect(() => {
  const timer = setTimeout(() => setIsInitialLoad(false), 1000);
  return () => clearTimeout(timer);
}, []);
```

**Flagged by:** TypeScript Reviewer, Performance Oracle, Architecture Strategist

## Proposed Solutions

### Option A: Add cleanup useEffect (Recommended)
```typescript
useEffect(() => {
  return () => {
    if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
  };
}, []);
```
- Pros: Matches greyboard pattern, prevents timer leak
- Cons: None
- Effort: Small (3 lines)
- Risk: None

## Acceptance Criteria

- [ ] Timer is cleared when `ScrollableArticleList` unmounts
- [ ] No stale `setShouldAnimate` calls after navigation

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-12 | Created from code review | Always add useEffect cleanup for timers managed in refs |
