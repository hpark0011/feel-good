# @feel-good/features

Shared feature components across Feel Good apps.

## Installation

Add to your app's dependencies:

```json
{
  "dependencies": {
    "@feel-good/features": "workspace:*"
  }
}
```

## Auth Feature

Authentication components and utilities using Better Auth with Convex.

### Auth Package Layers

| Layer | Import | Purpose |
|-------|--------|---------|
| Blocks | `@feel-good/features/auth/blocks` | Drop-in page sections |
| Forms | `@feel-good/features/auth/components/forms` | Complete forms with logic |
| Views | `@feel-good/features/auth/views` | Pure UI components |
| Hooks | `@feel-good/features/auth/hooks` | Headless auth logic |
| Providers | `@feel-good/features/auth/providers` | Context providers |

### Quick Start (Blocks)

```typescript
import { LoginBlock } from "@feel-good/features/auth/blocks"
import { authClient } from "@/lib/auth-client"

export default function LoginPage() {
  return <LoginBlock authClient={authClient} />
}
```

### Legacy Components (Backwards Compatible)

```typescript
import {
  SignInForm,
  SignUpForm,
  ForgotPasswordForm,
  ResetPasswordForm,
  MagicLinkForm,
  OAuthButtons,
  SessionProvider,
  FormError,
  FormSuccess,
} from "@feel-good/features/auth/components";
```

### Hooks

```typescript
import {
  usePasswordSignIn,
  usePasswordSignUp,
  useMagicLinkRequest,
  useForgotPassword,
  useResetPassword,
  useAuthClient,
  createUseSession,
} from "@feel-good/features/auth/hooks";
```

### Client/Server Utilities

```typescript
// Client-side auth
import { getAuthClient } from "@feel-good/features/auth/client";

// Server-side auth
import { auth } from "@feel-good/features/auth/server";

// Types
import type { AuthSession, AuthUser, AuthError, AuthStatus } from "@feel-good/features/auth/types";
```

## Structure

```
auth/
├── blocks/               # Layer 1: Page sections
│   ├── login-block.tsx
│   ├── sign-up-block.tsx
│   ├── forgot-password-block.tsx
│   ├── reset-password-block.tsx
│   └── shared/           # Layout helpers
├── components/
│   ├── forms/            # Layer 2: Container components
│   └── shared/           # Shared pieces
├── views/                # Layer 3: Pure UI components
├── hooks/                # Layer 4: Headless logic
├── providers/            # Context providers
├── lib/schemas/          # Zod validation schemas
├── utils/                # Auth utilities
├── client.ts             # Client-side auth setup
├── server.ts             # Server-side auth setup
├── types.ts              # TypeScript types
└── index.ts              # Barrel export
```

## Adding New Features

1. Create feature directory in package root (e.g., `notifications/`)
2. Add barrel export in `index.ts`
3. Update `package.json` exports field
4. Run `pnpm install` from monorepo root

## Dependencies

- `@feel-good/ui` - UI components
- `@feel-good/icons` - Icons (GoogleIcon)
- `better-auth` - Authentication library
- `@convex-dev/better-auth` - Convex adapter
- `convex` - Real-time backend
- `zod` - Validation schemas
