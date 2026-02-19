# File Organization Convention

> Canonical source: `docs/conventions/file-organization-convention.md`

Key highlights:

- **Only `_components/`** for new route-private code (no `_hooks/`, `_utils/`, `_views/`, `_data/`)
- **Feature-first** organization: `features/<feature>/{components,hooks,context,store,types,utils,lib}/`
- **Promotion ladder**: route-level → app-level → package-level

## components/ vs views/ (Critical for AI agents)

**All React components go in `components/`.** This includes pure-presentational components, context-reading connectors, dialogs, modals, dropdowns, and composition wrappers. Do NOT create a `views/` directory in app-level feature modules.

**`views/` is only for cross-app packages** (`packages/features/<feature>/views/`) where it defines a package API boundary — the pure-UI layer that consuming apps can customize.

## Component naming suffixes

| Suffix | Meaning | Example |
|--------|---------|---------|
| `-connector.tsx` | Reads context/hooks, delegates to a UI component. No markup of its own. | `article-list-toolbar-connector.tsx` |
| *(none)* | Everything else — UI, presentational, interactive, dialogs. | `article-list-toolbar.tsx` |

**`-connector` is required** when a component exists solely to bridge context to props. Do not use `-view` suffix for new files.

## Feature file placement

Within a feature module, placement is mechanical:

| File type                    | Directory              |
| ---------------------------- | ---------------------- |
| React component (any kind)   | `components/`          |
| Custom hook                  | `hooks/`               |
| Context provider             | `context/`             |
| Types/interfaces             | `types/` or co-located |
| Utility functions            | `utils/`               |
| Adapters, schemas, mock data | `lib/`                 |
| State store                  | `store/`               |

See the canonical source for full rules, import boundaries, and migration direction.
