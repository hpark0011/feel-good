---
title: "feat: Add article sort by published date"
type: feat
date: 2026-02-12
---

# feat: Add article sort by published date

## Overview

Add a sort dropdown to the article toolbar that lets users sort articles by published date (Newest / Oldest). When the sort order changes, the article list replays a staggered entrance animation matching the greyboard ticket card pattern.

## Acceptance Criteria

- [x] Sort button in toolbar opens a dropdown with "Newest" and "Oldest" options
- [x] Default sort order is "Newest" (descending by `published_at`)
- [x] Selecting an option re-sorts the article list immediately
- [x] On sort change, articles animate in with staggered entrance (opacity + translateY + scale spring)
- [x] Animation matches greyboard's `cardVariants` pattern (stagger delay `index * 0.05`)
- [x] Animation only plays on sort change, not on every render

## Architecture

```
article-toolbar.tsx ──> article-sort-dropdown.tsx (new)
                              │
                              ▼
scrollable-article-list.tsx ──> useState(sortOrder)
         │                            │
         ▼                            ▼
  use-article-list.ts ◄── sortOrder ──┘
  (sort + paginate)
         │
         ▼
  article-list-view.tsx ──> AnimatePresence + motion.tr
         │                     (triggers on sortOrder change)
         ▼
  article-list-item.tsx (wrapped with motion)
```

## Implementation

### Phase 1: Sort state & logic

#### `features/articles/hooks/use-article-sort.ts` (new)

```typescript
type SortOrder = "newest" | "oldest";

function useArticleSort() {
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  return { sortOrder, setSortOrder };
}
```

Single responsibility: manages sort state only.

#### `features/articles/hooks/use-article-list.ts` (modify)

Add `sortOrder` parameter. Sort articles before paginating:

```typescript
function useArticleList(allArticles: Article[], sortOrder: SortOrder) {
  // Sort by published_at based on sortOrder
  const sorted = useMemo(() => {
    return [...allArticles].sort((a, b) => {
      const diff = new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
      return sortOrder === "newest" ? diff : -diff;
    });
  }, [allArticles, sortOrder]);

  // Then paginate the sorted list
  const articles = sorted.slice(0, page * PAGE_SIZE);
  // ...
}
```

### Phase 2: Sort dropdown UI

#### `features/articles/components/article-sort-dropdown.tsx` (new)

Uses `DropdownMenu` with `DropdownMenuRadioGroup` from `@feel-good/ui/primitives/dropdown-menu`. Replaces the stub sort button in the toolbar.

```typescript
type ArticleSortDropdownProps = {
  value: SortOrder;
  onChange: (order: SortOrder) => void;
};

function ArticleSortDropdown({ value, onChange }: ArticleSortDropdownProps) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <Icon name="ArrowUpAndDownIcon" className="size-4.5" />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>Sort</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
          <DropdownMenuRadioItem value="newest">Newest</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="oldest">Oldest</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

#### `features/articles/components/article-toolbar.tsx` (modify)

- Add `sortOrder` and `onSortChange` props
- Replace stub sort button (lines 67-78) with `<ArticleSortDropdown>`

### Phase 3: Staggered entrance animation

**Dependency:** Add `framer-motion` to `apps/mirror/package.json` — required to match greyboard's spring physics animation exactly.

#### `features/articles/utils/article-list.config.ts` (new)

Animation variants matching greyboard's `cardVariants`:

```typescript
import type { Variants } from "framer-motion";

export const articleRowVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.98 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: index * 0.05,
      type: "spring",
      damping: 20,
      stiffness: 300,
    },
  }),
};
```

#### `features/articles/components/animated-article-row.tsx` (new)

Wrapper component following the `AnimatedTicketCardWrapper` pattern. Conditionally renders `motion.tr` (animated) or plain `<TableRow>` (static) based on a `shouldAnimate` flag.

Key difference from greyboard: this wraps table rows (`motion.tr`) instead of divs.

#### Animation trigger in `scrollable-article-list.tsx`

```typescript
// Track sort changes to trigger animation
const [shouldAnimate, setShouldAnimate] = useState(false);
const prevSortRef = useRef(sortOrder);

useEffect(() => {
  if (prevSortRef.current !== sortOrder) {
    setShouldAnimate(true);
    prevSortRef.current = sortOrder;
    const timer = setTimeout(() => setShouldAnimate(false), 1000);
    return () => clearTimeout(timer);
  }
}, [sortOrder]);
```

Pass `shouldAnimate` down to `ArticleListView` → `ArticleListItem`.

### Phase 4: Wire it together

#### `features/articles/components/scrollable-article-list.tsx` (modify)

- Import and use `useArticleSort`
- Pass `sortOrder` to `useArticleList`
- Track sort changes for animation trigger
- Pass `sortOrder` + `onSortChange` to `ArticleToolbar`
- Pass `shouldAnimate` to `ArticleListView`

#### `features/articles/views/article-list-view.tsx` (modify)

- Accept `shouldAnimate` prop
- Pass `shouldAnimate` and `index` to each `ArticleListItem`

#### `features/articles/components/article-list-item.tsx` (modify)

- Accept `shouldAnimate` and `index` props
- Conditionally use `AnimatedArticleRow` (motion.tr) or plain `TableRow`

## File Summary

| File | Action | Purpose |
|------|--------|---------|
| `hooks/use-article-sort.ts` | New | Sort state hook |
| `components/article-sort-dropdown.tsx` | New | Dropdown UI |
| `utils/article-list.config.ts` | New | Animation variants |
| `components/animated-article-row.tsx` | New | Motion wrapper for table rows |
| `components/article-toolbar.tsx` | Modify | Replace stub with dropdown |
| `components/scrollable-article-list.tsx` | Modify | Integrate sort + animation state |
| `hooks/use-article-list.ts` | Modify | Accept sortOrder, sort before paginate |
| `views/article-list-view.tsx` | Modify | Pass animation props |
| `components/article-list-item.tsx` | Modify | Conditional animation wrapper |
| `index.ts` | Modify | Export `SortOrder` type |
| `apps/mirror/package.json` | Modify | Add `framer-motion` dependency |

## Dependencies

- `framer-motion` — new dependency for mirror app (already used in greyboard)

## References

- Toolbar stub: `apps/mirror/features/articles/components/article-toolbar.tsx:67-78`
- Greyboard animation: `apps/greyboard/features/ticket-card/components/animated-ticket-card-wrapper.tsx`
- Card variants: `apps/greyboard/features/ticket-card/utils/ticket-card.config.ts:8-25`
- List usage: `apps/greyboard/features/task-list/components/list-section.tsx:40-46`
- DropdownMenu: `packages/ui/src/primitives/dropdown-menu.tsx`
- Article hook: `apps/mirror/features/articles/hooks/use-article-list.ts`
- Mock data: `apps/mirror/features/articles/lib/mock-articles.ts`
