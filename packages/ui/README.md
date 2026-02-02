# UI - @feel-good/ui

This package is responsible for managing the UI components and styles across the app.

This package define two sets of components:

- `Components`: Custom components
- `Primitives`: Components pulled from Shadcn/ui

## Adding New Components

1. If it's from shadcn/ui, create in `src/primitives/`
2. If it's a custom component, create in `src/components/`
3. Add export to `package.json` exports field
4. Run `pnpm install` from monorepo root
