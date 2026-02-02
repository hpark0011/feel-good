---
title: Add Blocks Navigation Group to UI Factory Sidebar
type: feat
date: 2026-02-02
---

# Add Blocks Navigation Group to UI Factory Sidebar

Separate the sidebar navigation into two groups: "Components" for primitive UI components and "Blocks" for composed patterns like login forms.

## Current State

The `navigation.config.ts` has a single flat array mixing components and blocks:

```typescript
// config/navigation.config.ts
export const NAVIGATION_ITEMS: NavItem[] = [
  { label: "Button", href: "/components/buttons" },
  { label: "Input", href: "/components/input" },
  { label: "Sidebar", href: "/components/sidebar" },
  { label: "Switch", href: "/components/switch" },
  { label: "Login", href: "/blocks/login" },  // Block mixed with components
];
```

The `app-sidebar.tsx` renders a single "Components" group.

## Proposed Solution

1. **Restructure `navigation.config.ts`** to export separate arrays:
   - `COMPONENT_NAV_ITEMS` for primitives (`/components/*`)
   - `BLOCK_NAV_ITEMS` for blocks (`/blocks/*`)

2. **Update `app-sidebar.tsx`** to render two `SidebarGroup` sections

## Acceptance Criteria

- [x] "Components" group contains: Button, Input, Sidebar, Switch
- [x] "Blocks" group contains: Login
- [x] Both groups render with proper labels in the sidebar
- [x] Active state works correctly for both groups

## MVP

### config/navigation.config.ts

```typescript
export type NavItem = {
  label: string;
  href: string;
};

export const COMPONENT_NAV_ITEMS: NavItem[] = [
  { label: "Button", href: "/components/buttons" },
  { label: "Input", href: "/components/input" },
  { label: "Sidebar", href: "/components/sidebar" },
  { label: "Switch", href: "/components/switch" },
];

export const BLOCK_NAV_ITEMS: NavItem[] = [
  { label: "Login", href: "/blocks/login" },
];
```

### components/app-sidebar.tsx

Add second `SidebarGroup` for Blocks:

```tsx
<SidebarGroup>
  <SidebarGroupLabel className="rounded-none h-auto mb-2">
    Blocks
  </SidebarGroupLabel>
  <SidebarGroupContent>
    <SidebarMenu>
      {BLOCK_NAV_ITEMS.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
            size="swiss-default"
            variant="swiss"
          >
            <Link href={item.href}>{item.label}</Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  </SidebarGroupContent>
</SidebarGroup>
```

## References

- `apps/ui-factory/config/navigation.config.ts:6` - Current navigation config
- `apps/ui-factory/components/app-sidebar.tsx:30` - Current sidebar group
- `apps/ui-factory/app/blocks/` - Existing blocks directory
