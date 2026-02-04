# Dock Feature

A macOS-style application dock component for navigating between apps. Features auto-hide behavior, smooth animations, and a layered architecture for flexible integration.

## Quick Start

The fastest way to add a dock to your app is using the `AppDock` block:

```tsx
import { AppDock } from "@feel-good/features/dock/blocks";
import { HomeIcon, SettingsIcon, ProfileIcon } from "@feel-good/icons";

const dockConfig = {
  placement: "bottom",
  defaultAppId: "home",
  apps: [
    { id: "home", name: "Home", icon: HomeIcon, route: "/", order: 1 },
    { id: "settings", name: "Settings", icon: SettingsIcon, route: "/settings", order: 2 },
    { id: "profile", name: "Profile", icon: ProfileIcon, route: "/profile", order: 3 },
  ],
};

export function Layout({ children }) {
  return (
    <>
      {children}
      <AppDock
        config={dockConfig}
        onAppClick={(appId) => console.log(`Clicked ${appId}`)}
      />
    </>
  );
}
```

## Layer Architecture

The dock feature follows a four-layer architecture for maximum flexibility:

| Layer | Import | Purpose |
|-------|--------|---------|
| Blocks | `@feel-good/features/dock/blocks` | Drop-in dock with all behavior built-in |
| Components | `@feel-good/features/dock/components` | Individual UI primitives for custom composition |
| Hooks | `@feel-good/features/dock/hooks` | Headless logic for visibility and config management |
| Providers | `@feel-good/features/dock/providers` | Context providers for state management |
| Lib | `@feel-good/features/dock/lib` | Types and validation schemas |

## Props Documentation

### AppDock (Block)

The main drop-in component that provides a complete dock experience.

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `config` | `DockConfig` | Yes | Configuration object for the dock |
| `onAppClick` | `(appId: string) => void` | No | Callback when an app is clicked |
| `className` | `string` | No | Additional CSS classes |

### DockConfig

Configuration object for the dock.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `placement` | `"bottom"` | Yes | Position of the dock on screen |
| `apps` | `DockApp[]` | Yes | Array of apps to display |
| `defaultAppId` | `string` | Yes | ID of the initially active app |

### DockApp

Configuration for individual apps in the dock.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | `string` | Yes | Unique identifier for the app |
| `name` | `string` | Yes | Display name shown in tooltip |
| `icon` | `ComponentType<{ className?: string }>` | Yes | Icon component to render |
| `route` | `string` | Yes | Navigation route when clicked |
| `order` | `number` | Yes | Sort order (lower = left) |

## Customization Examples

### Using Primitive Components

For full control, compose the dock using primitive components:

```tsx
import {
  DockRoot,
  DockContainer,
  DockItem,
  DockIcon,
} from "@feel-good/features/dock/components";
import { DockProvider, useDock } from "@feel-good/features/dock/providers";
import { useDockVisibility, useDockConfig } from "@feel-good/features/dock/hooks";

function CustomDock() {
  const { state, setActiveAppId } = useDock();
  const { isVisible, handlers } = useDockVisibility({ hideDelay: 500 });
  const { sortedApps } = useDockConfig();

  return (
    <DockRoot>
      {/* Activation zone */}
      <div
        className="absolute inset-x-0 bottom-0 h-20"
        onMouseEnter={handlers.onActivationZoneEnter}
      />

      <DockContainer isVisible={isVisible} onMouseLeave={handlers.onDockLeave}>
        {sortedApps.map((app) => (
          <DockItem
            key={app.id}
            label={app.name}
            isActive={state.activeAppId === app.id}
            onClick={() => setActiveAppId(app.id)}
          >
            <DockIcon icon={app.icon} isActive={state.activeAppId === app.id} />
          </DockItem>
        ))}
      </DockContainer>
    </DockRoot>
  );
}

export function App() {
  return (
    <DockProvider config={dockConfig}>
      <CustomDock />
    </DockProvider>
  );
}
```

### Custom Visibility Behavior

Use the `useDockVisibility` hook to control when the dock shows/hides:

```tsx
import { useDockVisibility } from "@feel-good/features/dock/hooks";

function MyComponent() {
  const { isVisible, show, hide, handlers } = useDockVisibility({
    hideDelay: 500, // Wait 500ms before hiding
  });

  // Programmatically show the dock
  const handleShowDock = () => show();

  // The handlers object provides ready-to-use event handlers:
  // - handlers.onActivationZoneEnter - shows the dock
  // - handlers.onDockLeave - triggers hide after delay
}
```

### Accessing Config and State

Use the `useDockConfig` hook for computed values:

```tsx
import { useDockConfig } from "@feel-good/features/dock/hooks";

function MyComponent() {
  const {
    config,      // Full dock configuration
    sortedApps,  // Apps sorted by order
    activeApp,   // Currently active app object
    activeAppId, // Currently active app ID
    setActiveApp // Function to change active app
  } = useDockConfig();

  return (
    <div>
      Current app: {activeApp?.name}
    </div>
  );
}
```

## Component Props Reference

### DockRoot

Container that positions the dock at the bottom of the viewport.

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Content to render |
| `className` | `string` | Additional CSS classes |

### DockContainer

The visible dock bar with styling and animations.

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Dock items to render |
| `isVisible` | `boolean` | Whether the dock is visible (default: `true`) |
| `className` | `string` | Additional CSS classes |
| `onMouseLeave` | `() => void` | Called when mouse leaves the dock |

### DockItem

Individual clickable item with tooltip and active indicator.

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Icon content to render |
| `label` | `string` | Tooltip text |
| `isActive` | `boolean` | Whether this item is active |
| `onClick` | `() => void` | Click handler |
| `className` | `string` | Additional CSS classes |

### DockIcon

Icon wrapper with hover and active states.

| Prop | Type | Description |
|------|------|-------------|
| `icon` | `ComponentType<{ className?: string }>` | Icon component to render |
| `isActive` | `boolean` | Whether to show active styling |
| `className` | `string` | Additional CSS classes |

## Validation Schemas

Zod schemas are available for validating dock configuration:

```tsx
import {
  dockConfigSchema,
  dockAppSchema,
  dockPlacementSchema,
} from "@feel-good/features/dock/lib";

// Validate config at runtime
const result = dockConfigSchema.safeParse(myConfig);
if (!result.success) {
  console.error(result.error);
}
```
