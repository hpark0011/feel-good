# Mirror

Mirror is an interactive blogging platform that turns blog articles into a conversational digital clone of the author that readers can chat with.

## Commands

```bash
pnpm dev          # Start dev server (http://localhost:3001)
pnpm build        # Production build
pnpm lint         # ESLint - MUST pass before commits
```

Or from monorepo root:

```bash
pnpm dev --filter=@feel-good/mirror
```

## Tech Stack

| Category  | Technology                                    |
| --------- | --------------------------------------------- |
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Backend   | Convex (real-time)                            |
| Auth      | Better Auth with @convex-dev/better-auth      |
| Styling   | Tailwind CSS, @feel-good/ui                   |

## Dependencies

- `@feel-good/convex` - Shared Convex backend
- `@feel-good/features` - Auth components and hooks
- `@feel-good/ui` - Shared UI components

## Project Structure

```
app/
  (auth)/                # Auth flow (sign-in, sign-up, callback)
  (protected)/dashboard/ # Dashboard page
    _views/              # Route-specific view components
    articles/            # Articles sub-route
      _data/             # Mock/static article data
      _hooks/            # Article-specific hooks
      _views/            # Article view components
  _views/                # App root view components

lib/                     # Auth client, env, services
providers/               # React context providers
```

**Path aliases:** `@/*` maps to `apps/mirror/` root

## Key Patterns

- Server components by default
- Better Auth for session management
- Convex for real-time data synchronization
- Uses shared auth components from @feel-good/features

## Auth Flow

Authentication is handled by the shared `@feel-good/features` package (OTP and magic-link):

```typescript
// Forms
import {
  MagicLinkLoginForm,
  MagicLinkSignUpForm,
  OTPLoginForm,
  OTPSignUpForm,
} from "@feel-good/features/auth/components/forms";

// Hooks
import {
  useMagicLinkRequest,
  useOTPAuth,
  createUseSession,
} from "@feel-good/features/auth/hooks";

// Blocks (drop-in page sections)
import { LoginBlock, SignUpBlock } from "@feel-good/features/auth/blocks";
```
