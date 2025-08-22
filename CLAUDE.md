# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `pnpm dev` - Start development server with Turbopack at http://localhost:3000
- `pnpm build` - Build the production application
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint to check code quality

### Package Management
Use `pnpm` for all package operations (not npm, yarn, or bun).

## Architecture

### Tech Stack
- **Next.js 15.4.7** with App Router
- **React 19** with React Compiler
- **TypeScript 5** with strict configuration
- **Tailwind CSS 4** for styling
- **shadcn/ui components** with Radix UI primitives
- **React Hook Form + Zod** for forms and validation
- **TanStack Query** for data fetching and caching

### Project Structure
- `/app` - Next.js App Router pages and layouts
- `/components/ui` - shadcn/ui components (pre-configured with New York style)
- `/components/providers` - React context providers for theming, query client, etc.
- `/lib` - Utility functions and shared logic
- `/hooks` - Custom React hooks
- `/PRPs` - Product Requirements Plans for features

### Path Aliases
- `@/*` maps to the project root
- Common imports: `@/components`, `@/lib/utils`, `@/hooks`

## Development Principles

### Core Principles (from Cursor rules)
- **KISS**: Keep solutions simple and straightforward
- **YAGNI**: Build only what's needed now
- **Clear separation of concerns**: Don't mix different concerns in one function
- **Performance**: Fast startup, responsive UI, optimistic updates
- **Privacy**: Data encryption and user control

### Component Development
- All UI components use shadcn/ui with Radix UI primitives
- Components are already installed in `/components/ui`
- Use `clsx` and `tailwind-merge` via `@/lib/utils` for className management
- Icons: Use Lucide React (already configured as default icon library)

### Forms and Validation
- Use React Hook Form for all form handling
- Use Zod for schema validation
- Form components available at `@/components/ui/form`

### Styling
- Tailwind CSS 4 with CSS variables for theming
- Global styles in `/app/globals.css`
- Component styles use `cn()` utility from `@/lib/utils`

## Feature Development

### Feature Flag System (Planned)
A PRP exists at `/PRPs/feature-flag-system.md` for implementing an environment-variable-based feature flag system using TypeScript without additional dependencies.

### Environment Variables
- Client-side variables must use `NEXT_PUBLIC_` prefix
- Server-side variables don't need the prefix
- Define in `.env.local` for development