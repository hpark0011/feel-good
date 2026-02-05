# Dock Feature Orchestrator

Orchestrates the phased implementation of the dock feature using parallel sub-agents with quality gates between phases.

## Trigger

- `/dock-orchestrator` or `/build-dock`
- User asks to "implement the dock feature" or "build the dock"

## Workflow

### Phase Execution Pattern

For each phase:
1. **Announce** the phase and what agents will run
2. **Spawn agents in parallel** using Task tool (send all Task calls in single message)
3. **Wait** for all agents to complete
4. **Run quality gate** via Bash
5. **Report results** - if gate fails, stop and report; if passes, continue

### Phase 1: Foundation (3 parallel agents)

**Agent 1: types-agent**
```
Create dock type definitions in packages/features/dock/lib/types.ts

Files to create:
- packages/features/dock/lib/types.ts
- packages/features/dock/lib/index.ts (barrel export)

Requirements:
- DockPlacement type: 'bottom' (extensible later)
- DockApp interface: id, name, icon (React.ComponentType), route, order
- DockConfig interface: placement, apps, defaultAppId
- DockState interface: isVisible, activeAppId
- Export all types

Reference: packages/features/auth/types.ts for patterns
```

**Agent 2: schema-agent**
```
Create dock validation schema in packages/features/dock/lib/schemas/

Files to create:
- packages/features/dock/lib/schemas/dock.schema.ts
- packages/features/dock/lib/schemas/index.ts

Requirements:
- Zod schema for DockApp validation
- Zod schema for DockConfig validation
- Export inferred types

Reference: packages/features/auth/lib/schemas/ for patterns
```

**Agent 3: package-setup-agent**
```
Setup package exports for dock feature

Files to modify:
- packages/features/package.json (add dock exports)

Files to create:
- packages/features/dock/index.ts (main barrel)

Exports to add:
- "./dock": "./dock/index.ts"
- "./dock/blocks": "./dock/blocks/index.ts"
- "./dock/components": "./dock/components/index.ts"
- "./dock/hooks": "./dock/hooks/index.ts"
- "./dock/providers": "./dock/providers/index.ts"
- "./dock/lib/types": "./dock/lib/types.ts"

Create placeholder index.ts files in each directory to prevent import errors.
```

**Quality Gate 1:**
```bash
pnpm check-types --filter=@feel-good/features
```

---

### Phase 2: Logic Layer (4 parallel agents)

**Agent 4: provider-agent**
```
Create DockProvider in packages/features/dock/providers/

Files to create:
- packages/features/dock/providers/dock-provider.tsx
- packages/features/dock/providers/index.ts

Requirements:
- "use client" directive
- DockContext with DockContextValue type
- DockProvider component accepting config and initialActiveAppId props
- useDock hook that throws if used outside provider
- Manage isVisible (boolean) and activeAppId (string | null) state
- Use useMemo for context value

Reference: packages/features/auth/providers/auth-provider.tsx
```

**Agent 5: visibility-hook-agent**
```
Create useDockVisibility hook in packages/features/dock/hooks/

Files to create:
- packages/features/dock/hooks/use-dock-visibility.ts

Requirements:
- "use client" directive
- Import useDock from providers
- Options: hideDelay (default 300ms)
- Return: isVisible, show(), hide(), handlers object
- handlers.onActivationZoneEnter - clears timeout, shows dock
- handlers.onDockLeave - sets timeout to hide
- Use useRef for timeout cleanup
- Use useCallback for stable references

Reference: packages/ui/src/primitives/sidebar.tsx for show/hide patterns
```

**Agent 6: config-hook-agent**
```
Create useDockConfig hook in packages/features/dock/hooks/

Files to create:
- packages/features/dock/hooks/use-dock-config.ts
- packages/features/dock/hooks/index.ts (barrel for all hooks)

Requirements:
- "use client" directive
- Import useDock from providers
- Return: config, sortedApps (sorted by order), activeApp, setActiveApp
- Memoize sortedApps with useMemo

Reference: Keep it simple, derive from useDock context
```

**Agent 7: shared-components-agent**
```
Create shared dock components in packages/features/dock/components/

Files to create:
- packages/features/dock/components/dock-icon.tsx
- packages/features/dock/components/index.ts

DockIcon requirements:
- "use client" directive
- Props: icon (ComponentType), isActive, className
- Size: 48px (size-12)
- CSS: [corner-shape:superellipse(1.2)] rounded-xl (fallback)
- Background: bg-muted/50, hover:bg-muted
- Active state: bg-primary/10 ring-2 ring-primary/20
- Click: active:scale-97 transition-transform duration-100
- Use data-slot="dock-icon" and data-active attribute

Reference: packages/ui/src/primitives/button.tsx for active:scale pattern
```

**Quality Gate 2:**
```bash
pnpm lint --filter=@feel-good/features && pnpm check-types --filter=@feel-good/features
```

---

### Phase 3: Primitive Components (2 parallel agents)

**Agent 8: container-components-agent**
```
Create dock container components in packages/features/dock/components/

Files to create:
- packages/features/dock/components/dock-root.tsx
- packages/features/dock/components/dock-container.tsx

DockRoot requirements:
- "use client" directive
- Props: children, className
- Fixed positioning: fixed inset-x-0 bottom-0 z-50
- data-slot="dock-root"

DockContainer requirements:
- "use client" directive
- Props: children, isVisible, className, onMouseLeave
- Role: navigation with aria-label="App navigation"
- Position: fixed bottom-2 left-1/2 -translate-x-1/2
- Layout: flex items-center gap-2 px-3 py-2
- Appearance: bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg
- Animation: transition-transform duration-200 ease-out
- Visible: translate-y-0, Hidden: translate-y-[calc(100%+16px)]
- data-slot="dock-container" data-state={isVisible ? "visible" : "hidden"}

Update components/index.ts barrel export
```

**Agent 9: item-component-agent**
```
Create DockItem component in packages/features/dock/components/

Files to create:
- packages/features/dock/components/dock-item.tsx

Requirements:
- "use client" directive
- Props: children, label, isActive, onClick, className
- Import Tooltip from @feel-good/ui/primitives/tooltip
- Wrap in Tooltip with TooltipTrigger (asChild) and TooltipContent
- TooltipContent: side="top" sideOffset={8}
- Button element with role="button" aria-pressed={isActive} aria-label={label}
- Focus styles: focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
- Active indicator: absolute dot below icon when isActive
- data-slot="dock-item"

Update components/index.ts barrel export
```

**Quality Gate 3:**
```bash
pnpm check-types --filter=@feel-good/features
```

---

### Phase 4: Block Assembly (1 agent)

**Agent 10: block-agent**
```
Create AppDock block in packages/features/dock/blocks/

Files to create:
- packages/features/dock/blocks/app-dock.tsx
- packages/features/dock/blocks/index.ts

AppDock requirements:
- "use client" directive
- Props: config (DockConfig), onAppClick callback, className
- Compose: DockProvider > AppDockContent
- AppDockContent uses useDock and useDockVisibility
- Render: DockRoot with activation zone div (h-[72px] onMouseEnter)
- Render: DockContainer with onMouseLeave
- Map sortedApps to DockItem > DockIcon
- Handle click: setActiveApp + onAppClick callback

Update blocks/index.ts and main dock/index.ts barrel exports
```

**Quality Gate 4:**
```bash
pnpm check-types --filter=@feel-good/features && pnpm lint --filter=@feel-good/features
```

---

### Phase 5: Integration (1 agent, sequential)

**Agent 11: integration-agent**
```
Final integration and documentation

Tasks:
1. Create usage example in packages/features/dock/README.md
2. Update packages/features/CLAUDE.md with dock documentation
3. Verify all barrel exports are correct
4. Test import paths work: @feel-good/features/dock/blocks, etc.

README should include:
- Quick start example with mock config
- Layer explanation (blocks, components, hooks, providers)
- Props documentation
- Customization examples
```

**Quality Gate 5:**
```bash
# Verify imports work
cd apps/greyboard && pnpm exec tsc --noEmit
```

---

## Execution Instructions

When invoked, the orchestrator should:

1. **Read the plan** at docs/plans/2026-02-04-feat-app-dock-navigation-ui-plan.md for reference

2. **Create directory structure first** (single agent):
   ```
   packages/features/dock/
   ├── lib/
   │   └── schemas/
   ├── hooks/
   ├── providers/
   ├── components/
   └── blocks/
   ```

3. **Execute phases sequentially** with parallel agents within each phase

4. **Between phases:**
   - Run the quality gate command
   - If it fails, stop and report the error
   - If it passes, announce success and continue

5. **After all phases:**
   - Summarize what was created
   - Provide next steps for testing in the app

## Error Handling

If a quality gate fails:
1. Report which phase failed
2. Show the error output
3. Ask user: "Fix and retry this phase, or stop?"

If an agent fails:
1. Report which agent failed
2. Show the error
3. Offer to retry just that agent

## Success Criteria

- All 5 quality gates pass
- Dock components render without errors
- TypeScript compilation succeeds
- All exports are accessible via package paths
