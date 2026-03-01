---
title: "feat: Chat Deep-Link URLs"
type: feat
status: active
date: 2026-03-01
origin: docs/plans/2026-02-28-feat-chat-thread-digital-clone-plan.md
---

# feat: Chat Deep-Link URLs

## Context

Chat deep-link URLs (`/@username/chat/[conversationId]`) are listed as a Future Consideration in the original chat plan (`docs/plans/2026-02-28-feat-chat-thread-digital-clone-plan.md`). Currently, chat state (`activeView`, `conversationId`) is pure React state in `profile-shell.tsx` — navigating away loses the chat context, and conversations can't be shared or bookmarked via URL.

This plan adds URL-based chat routing so that:
- Conversations are bookmarkable and shareable
- Browser back/forward works naturally between profile and chat views
- Direct navigation to a conversation deep-link works with access control

---

## Approach

### Route Structure

Add nested routes under `[username]/chat/`:

```
[username]/
  layout.tsx                        # (existing) — wraps all with ProfileShell
  page.tsx                          # (existing) — profile + article list
  chat/
    page.tsx                        # NEW — /@username/chat (new conversation)
    [conversationId]/
      page.tsx                      # NEW — /@username/chat/[conversationId]
  [slug]/page.tsx                   # (existing) — article detail
```

Next.js static segments (`chat/`) take precedence over dynamic segments (`[slug]/`), so `/@username/chat` won't collide with article slugs.

### Key Design Decisions

1. **Real routes, not searchParams** — Clean URLs (`/@username/chat/abc`) over `/@username?c=abc`. Proper browser history, server-side metadata control (noindex), and semantic URLs.

2. **Chat pages render article list** — The current `page.tsx` renders `<ScrollableArticleList>` as `{children}` in ProfileShell's right panel. Chat pages will render the same content so the right panel stays populated on desktop. This is trivial — the component is 6 lines and data comes from context already provided by ProfileShell.

3. **URL is synced, not source-of-truth** — ProfileShell initializes state from URL, then keeps URL and state in sync bidirectionally. Direct state updates + `router.push/replace` avoids any delay in UI transitions.

4. **`router.push` for view transitions, `router.replace` for conversation switches** — Entering/exiting chat creates history entries (back button works). Switching conversations within chat replaces the URL (no history pollution).

5. **`/@username/chat` (no ID) is valid** — Shows chat with no active conversation (welcome/empty state). When first message creates a conversation, URL replaces to `/@username/chat/[newId]`.

---

## Implementation Phases

### Phase 1: Routing Infrastructure

**`apps/mirror/next.config.ts`** — Add chat URL rewrites BEFORE the generic slug rewrite:
```typescript
rewrites: async () => [
  { source: "/@:username", destination: "/:username" },
  { source: "/@:username/chat", destination: "/:username/chat" },
  { source: "/@:username/chat/:conversationId", destination: "/:username/chat/:conversationId" },
  { source: "/@:username/:slug", destination: "/:username/:slug" },
],
```

**`apps/mirror/lib/reserved-usernames.ts`** — Add `"chat"` to `RESERVED_USERNAMES` to prevent a user from registering `chat` as their username.

### Phase 2: Chat Route Pages

**`apps/mirror/app/[username]/chat/page.tsx`** (new) — New conversation entry point. Renders the same article list content as `page.tsx` for the right panel:
```typescript
import { Metadata } from "next";
import { ArticleListToolbarConnector, ScrollableArticleList } from "@/features/articles";
import { WorkspaceToolbar } from "@/components/workspace-toolbar-slot";

export const metadata: Metadata = { robots: "noindex, nofollow" };

export default function ChatPage() {
  return (
    <>
      <WorkspaceToolbar>
        <ArticleListToolbarConnector />
      </WorkspaceToolbar>
      <ScrollableArticleList />
    </>
  );
}
```

**`apps/mirror/app/[username]/chat/[conversationId]/page.tsx`** (new) — Same content, with noindex metadata.

### Phase 3: ProfileShell URL Synchronization (core change)

**`apps/mirror/app/[username]/_components/profile-shell.tsx`** — This is the main change.

**a) Import routing hooks:**
```typescript
import { usePathname, useParams, useRouter } from "next/navigation";
```

**b) Derive chat state from URL on mount + sync on pathname changes:**
```typescript
const pathname = usePathname();
const params = useParams<{ username: string; conversationId?: string }>();
const router = useRouter();

const isChatRoute = /^\/@[^/]+\/chat/.test(pathname);

// Initialize from URL
const [activeView, setActiveView] = useState<"profile" | "chat">(
  isChatRoute ? "chat" : "profile"
);
const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(
  (params.conversationId as Id<"conversations">) ?? null
);

// Sync URL → state (browser back/forward)
useEffect(() => {
  const urlView = isChatRoute ? "chat" : "profile";
  const urlConvId = (params.conversationId as Id<"conversations">) ?? null;
  setActiveView(urlView);
  setConversationId(urlConvId);
}, [pathname]); // pathname is the only dependency — fires on any navigation
```

**c) URL-updating handlers (replace current handlers):**
```typescript
// Called by ChatProvider when conversation changes (sidebar switch, new conversation created)
const handleConversationIdChange = useCallback(
  (id: Id<"conversations"> | null) => {
    setConversationId(id);
    const base = `/@${profile.username}/chat`;
    router.replace(id ? `${base}/${id}` : base);
  },
  [router, profile.username],
);

// Called by profile ChatInput on first message
const handleFirstMessage = useCallback(
  async (message: string) => {
    if (isSendingFirstRef.current) return;
    isSendingFirstRef.current = true;
    try {
      const result = await sendMessageMutation({
        profileOwnerId: profile._id,
        content: message,
      });
      setConversationId(result.conversationId);
      setActiveView("chat");
      router.push(`/@${profile.username}/chat/${result.conversationId}`);
    } finally {
      isSendingFirstRef.current = false;
    }
  },
  [sendMessageMutation, profile._id, router, profile.username],
);

// Called by ChatThread back button
const handleBack = useCallback(() => {
  setActiveView("profile");
  router.push(`/@${profile.username}`);
}, [router, profile.username]);
```

**d) Update ChatProvider's `onConversationIdChange`:**
Pass `handleConversationIdChange` (which updates both state and URL) instead of bare `setConversationId`.

### Phase 4: Navigation Effects Fix

**`apps/mirror/hooks/use-profile-navigation-effects.ts`** — Exclude chat routes from article scroll behavior:
```typescript
const isArticleDetailRoute = (path: string) =>
  /^\/@[^/]+\/.+/.test(path) && !/^\/@[^/]+\/chat/.test(path);
```

Without this, navigating to `/@username/chat/xxx` would trigger the article-detail scroll-to-top behavior.

### Phase 5: Access Control UI for Deep Links

When someone visits `/@username/chat/invalid-id`, the Convex `getConversation` query returns `null`. Currently this silently shows the welcome/empty state, which is misleading.

**`apps/mirror/features/chat/hooks/use-chat.ts`** — Add `conversationNotFound` derived state:
```typescript
// undefined = loading, null = not found, object = found
const conversationNotFound = conversationId !== null && conversation === null;
```

Return `conversationNotFound` from the hook.

**`apps/mirror/features/chat/components/chat-thread.tsx`** — Render access-denied state:
```typescript
if (conversationNotFound) {
  return (
    <div className="flex flex-col h-full">
      <ChatHeader profileName={profileName} avatarUrl={avatarUrl} onBack={onBack} />
      <div className="flex-1 flex items-center justify-center px-6">
        <p className="text-sm text-muted-foreground">
          This conversation is not available.
        </p>
      </div>
    </div>
  );
}
```

---

## Files Summary

| File | Action | Purpose |
|------|--------|---------|
| `apps/mirror/next.config.ts` | Modify | Add `/@:username/chat` and `/@:username/chat/:conversationId` rewrites |
| `apps/mirror/lib/reserved-usernames.ts` | Modify | Add `"chat"` to reserved set |
| `apps/mirror/app/[username]/chat/page.tsx` | Create | Route for `/@username/chat` |
| `apps/mirror/app/[username]/chat/[conversationId]/page.tsx` | Create | Route for `/@username/chat/[id]` |
| `apps/mirror/app/[username]/_components/profile-shell.tsx` | Modify | URL sync for activeView + conversationId |
| `apps/mirror/hooks/use-profile-navigation-effects.ts` | Modify | Exclude chat routes from article scroll logic |
| `apps/mirror/features/chat/hooks/use-chat.ts` | Modify | Add `conversationNotFound` state |
| `apps/mirror/features/chat/components/chat-thread.tsx` | Modify | Render not-found state for invalid deep links |

---

## Edge Cases

- **Invalid Convex ID in URL**: `getConversation` returns `null` → `conversationNotFound` UI shown
- **Unauthorized access**: Same as above — query returns `null` for conversations the user can't see
- **Anonymous users**: Can access anonymous conversations via deep link (Convex access control allows this). Cannot list conversations.
- **Browser back/forward**: `useEffect` on `pathname` syncs state from URL
- **`chat` as username**: Prevented by adding `"chat"` to reserved usernames
- **Article slug "chat"**: Next.js static segment `chat/` takes precedence over `[slug]`, so no collision

---

## Verification

1. `pnpm build --filter=@feel-good/mirror` — passes
2. Navigate to `/@username` → profile view, articles in right panel
3. Send first message → URL changes to `/@username/chat/[id]`, chat view active, articles still in right panel (desktop)
4. Click back → URL changes to `/@username`, profile view restored
5. Browser back button → returns to `/@username/chat/[id]`, chat resumed
6. Direct navigation to `/@username/chat/[id]` → chat loads with correct conversation
7. Direct navigation to `/@username/chat/invalid` → "not available" message shown
8. Direct navigation to `/@username/chat` → chat view with empty/welcome state
9. Switch conversation in sidebar → URL replaces to new conversation ID
10. Mobile: chat takes over full screen, back returns to profile
11. `/@username/some-article` still works (no routing regression)

## Sources & References

### Origin

- **Parent plan:** [docs/plans/2026-02-28-feat-chat-thread-digital-clone-plan.md](docs/plans/2026-02-28-feat-chat-thread-digital-clone-plan.md) — Deep-link URLs listed under Future Considerations

### Internal References

- Profile shell: `apps/mirror/app/[username]/_components/profile-shell.tsx` (core integration point)
- URL rewrites: `apps/mirror/next.config.ts`
- Reserved usernames: `apps/mirror/lib/reserved-usernames.ts`
- Navigation effects: `apps/mirror/hooks/use-profile-navigation-effects.ts`
- Chat context: `apps/mirror/features/chat/context/chat-context.tsx`
- Chat hook: `apps/mirror/features/chat/hooks/use-chat.ts`
- Chat thread: `apps/mirror/features/chat/components/chat-thread.tsx`
- Profile page (article list reference): `apps/mirror/app/[username]/page.tsx`
