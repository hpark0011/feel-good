---
status: pending
priority: p2
issue_id: "141"
tags: [code-review, performance, animation, mirror]
dependencies: []
---

# Animation Timer / Stagger Duration Mismatch

## Problem Statement

The `shouldAnimate` flag in `scrollable-article-list.tsx` resets to `false` after 1000ms, but with 30 articles and a stagger delay of `index * 0.05s`, the last item's animation starts at 1.5 seconds. Items at index 20+ (delay >= 1.0s) will have their animations cut short or skipped entirely when the component switches from `motion.tr` to plain `<tr>` mid-animation.

## Source Review Finding

- `[P2] Keep sort animation window longer than stagger delay`

## Findings

**Affected Files:**
- `apps/mirror/features/articles/components/scrollable-article-list.tsx` (line 43: `setTimeout(..., 1000)`)
- `apps/mirror/features/articles/utils/article-list.config.ts` (stagger delay: `index * 0.05`)

**The math:**
- 30 items × 0.05s stagger = 1.5s for last item to start
- Spring animation takes ~300-500ms to settle
- Total animation window needed: ~2.0s
- Current timeout: 1.0s (too short by ~1.0s)

**Flagged by:** Performance Oracle, Architecture Strategist

## Proposed Solutions

### Option A: Dynamic timeout based on item count
```typescript
const STAGGER_DELAY_MS = 50;
const ANIMATION_BUFFER_MS = 500;
const animationWindowMs = paginatedArticles.length * STAGGER_DELAY_MS + ANIMATION_BUFFER_MS;

animationTimerRef.current = setTimeout(
  () => setShouldAnimate(false),
  animationWindowMs,
);
```
- Pros: Correct for any list size, self-documenting
- Cons: Requires importing stagger constant or co-locating with config
- Effort: Small
- Risk: Low

### Option B: Reduce stagger delay to fit 1000ms window
Change stagger from `0.05` to `0.03` so 30 items × 0.03s = 0.9s, plus spring settle time fits in ~1.2s.
- Pros: No timer change needed
- Cons: Animation feels faster/more compressed
- Effort: Small
- Risk: Low

## Acceptance Criteria

- [ ] Last article in a 30-item list completes its entrance animation fully
- [ ] No visible snap/jump when `shouldAnimate` flips to `false`

## Work Log

| Date | Action | Learnings |
|------|--------|-----------|
| 2026-02-12 | Created from code review | Animation window must account for `count * stagger + settle time` |
| 2026-02-12 | Linked latest Codex review finding label to this ticket | Keep one ticket per bug to avoid duplicate tracking |
