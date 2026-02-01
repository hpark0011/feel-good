---
title: "feat: Add Sidebar Navigation to UI Factory"
type: feat
date: 2026-02-01
---

# feat: Add Sidebar Navigation to UI Factory

## Overview

Add a global sidebar navigation system to UI Factory that allows users to navigate between component showcase pages. The sidebar is visible on desktop with toggle functionality (slides in/out) and uses the built-in Sheet component on mobile (< 768px).

## Problem Statement / Motivation

UI Factory currently has no navigation system between component pages. As the design system grows with more components (buttons, inputs, forms, etc.), users need a consistent way to browse and navigate between different component showcases.

## Proposed Solution

Implement a sidebar navigation using the existing `@feel-good/ui/primitives/sidebar` components with:

1. **Desktop (≥ 768px):** Collapsible sidebar that slides in/out from the left
2. **Mobile (< 768px):** Sheet component (built into shadcn sidebar) that slides from left edge
3. **Centralized config:** Single config file for managing navigation items
4. **Toggle persistence:** Sidebar state saved in cookies (built-in to shadcn sidebar)

## Technical Considerations

### Architecture

- Use existing `@feel-good/ui/primitives/sidebar` - no new sidebar code needed
- Follow greyboard's nav config pattern at `config/navs.config.ts`
- Wrap root layout with `SidebarProvider`
- Integrate `SidebarTrigger` with existing `nav-header.tsx`

### Component Structure

```
apps/ui-factory/
├── app/
│   └── layout.tsx                    # Wrap with SidebarProvider
├── components/
│   ├── app-sidebar.tsx               # NEW: Sidebar navigation component
│   └── nav-header.tsx                # UPDATE: Add SidebarTrigger
└── config/
    └── navigation.config.ts          # NEW: Centralized nav config
```

### Key Files to Modify/Create

| File | Action | Purpose |
|------|--------|---------|
| `config/navigation.config.ts` | Create | Centralized navigation items config |
| `components/app-sidebar.tsx` | Create | Sidebar component using shadcn primitives |
| `app/layout.tsx` | Modify | Wrap with SidebarProvider, add Sidebar + SidebarInset |
| `components/nav-header.tsx` | Modify | Add SidebarTrigger button |
| `styles/globals.css` | Verify | Ensure sidebar CSS variables exist |

### Import Pattern

```typescript
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarHeader,
  SidebarInset,
} from "@feel-good/ui/primitives/sidebar";
```

## Acceptance Criteria

### Functional Requirements

- [ ] Sidebar displays navigation items (Button, Input) on desktop
- [ ] Clicking navigation item navigates to corresponding route
- [ ] Active route is visually indicated in sidebar
- [ ] Toggle button shows/hides sidebar with slide animation
- [ ] Keyboard shortcut Cmd/Ctrl+B toggles sidebar (built-in)
- [ ] Mobile (< 768px) shows Sheet that slides from left
- [ ] Sheet closes automatically after navigation
- [ ] Sidebar state persists across page reloads (cookie)

### Non-Functional Requirements

- [ ] Navigation config is centralized in single file
- [ ] Adding new component requires only config file change
- [ ] Uses existing `@feel-good/ui` sidebar components (no duplication)
- [ ] Follows monorepo import conventions

## Success Metrics

- User can navigate between all component pages
- Sidebar toggle works smoothly on desktop
- Mobile Sheet provides equivalent navigation
- Developer can add new nav item in < 1 minute (config change only)

## Dependencies & Risks

**Dependencies:**
- `@feel-good/ui/primitives/sidebar` - already exists
- `@feel-good/ui/primitives/sheet` - already exists (used by sidebar for mobile)
- Tailwind CSS sidebar variables in globals.css

**Risks:**
- Low: Sidebar CSS variables may need to be added to globals.css
- Low: Current centered layout may need adjustment for sidebar

## MVP Implementation

### config/navigation.config.ts

```typescript
export type NavItem = {
  label: string;
  href: string;
};

export const NAVIGATION_ITEMS: NavItem[] = [
  { label: "Button", href: "/components/buttons" },
  { label: "Input", href: "/components/input" },
];
```

### components/app-sidebar.tsx

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
} from "@feel-good/ui/primitives/sidebar";
import { NAVIGATION_ITEMS } from "@/config/navigation.config";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <Link href="/" className="font-semibold px-2">
          UI Factory
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Components</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAVIGATION_ITEMS.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
```

### app/layout.tsx (updated)

```typescript
import { SidebarProvider, SidebarInset } from "@feel-good/ui/primitives/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { NavHeader } from "@/components/nav-header";
// ... existing imports

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <RootProvider>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              <NavHeader />
              <main>{children}</main>
            </SidebarInset>
          </SidebarProvider>
        </RootProvider>
      </body>
    </html>
  );
}
```

### components/nav-header.tsx (updated)

```typescript
import { SidebarTrigger } from "@feel-good/ui/primitives/sidebar";
// ... existing imports

export function NavHeader() {
  return (
    <header className="flex items-center gap-2 p-4 border-b">
      <SidebarTrigger />
      {/* existing header content */}
      <ThemeToggleButton />
    </header>
  );
}
```

### styles/globals.css (verify/add)

```css
:root {
  --sidebar: var(--gray-2);
  --sidebar-foreground: var(--gray-12);
  --sidebar-border: var(--gray-6);
  --sidebar-accent: var(--gray-4);
  --sidebar-accent-foreground: var(--gray-12);
  --sidebar-ring: var(--gray-8);
}

.dark {
  --sidebar: var(--gray-2);
  --sidebar-foreground: var(--gray-12);
  --sidebar-border: var(--gray-4);
  --sidebar-accent: var(--gray-4);
  --sidebar-accent-foreground: var(--gray-12);
  --sidebar-ring: var(--gray-4);
}
```

## Implementation Checklist

1. [x] Create `config/navigation.config.ts` with NavItem type and initial items
2. [x] Create `components/app-sidebar.tsx` using shadcn sidebar primitives
3. [x] Update `app/layout.tsx` to wrap with SidebarProvider and add sidebar structure
4. [x] Update `components/nav-header.tsx` to include SidebarTrigger
5. [x] Verify sidebar CSS variables in `styles/globals.css`
6. [x] Create placeholder `app/components/input/page.tsx` for Input route
7. [x] Test desktop sidebar toggle
8. [x] Test mobile Sheet behavior
9. [x] Test navigation between components
10. [x] Test active state indication
11. [x] Test sidebar state persistence (reload page)

## References & Research

### Internal References

- Sidebar primitives: `packages/ui/src/primitives/sidebar.tsx`
- Greyboard nav config pattern: `apps/greyboard/config/navs.config.ts`
- Current nav header: `apps/ui-factory/components/nav-header.tsx`
- Root layout: `apps/ui-factory/app/layout.tsx`
- Button variants config pattern: `apps/ui-factory/app/components/buttons/_utils/button-variants.config.ts`

### Monorepo Conventions

- Import from `@feel-good/ui/primitives/sidebar` (not relative paths)
- Use `cn()` from `@feel-good/utils` for class merging
- Follow existing config file patterns

### Built-in Features (from shadcn sidebar)

- Cookie persistence for sidebar state (7-day expiration)
- Keyboard shortcut: Cmd/Ctrl+B to toggle
- Mobile detection via `useIsMobile()` hook (768px breakpoint)
- Sheet component for mobile slide-in
- `collapsible="offcanvas"` mode for slide animation
