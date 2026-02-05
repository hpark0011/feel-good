# @feel-good/features/auth

Pluggable auth components for Feel Good apps.

## Quick Start

```tsx
import { LoginBlock } from "@feel-good/features/auth/blocks"
import { authClient } from "@/lib/auth-client"

export default function LoginPage() {
  return <LoginBlock authClient={authClient} />
}
```

## Abstraction Levels

| Import | Use When |
|--------|----------|
| `auth/blocks` | Most apps — drop-in page sections |
| `auth/components/forms` | Custom layouts — compose forms yourself |
| `auth/views` | Custom logic — bring your own state |
| `auth/hooks` | Fully custom UI — headless logic only |

## Available Blocks

- `LoginBlock` — Magic Link + OAuth sign-in
- `SignUpBlock` — Magic Link + OAuth registration
- `ForgotPasswordBlock` — Request password reset
- `ResetPasswordBlock` — Set new password

> **Product decision:** LoginBlock uses magic-link-only authentication (no password form).
> Magic links work for all accounts, including those originally registered with a password.
> The `PasswordLoginView` and `usePasswordSignIn` hook remain available for apps that need password login.

## Configuration

```tsx
<LoginBlock
  authClient={authClient}
  signUpHref="/sign-up"
  redirectTo="/dashboard"
  onSuccess={() => console.log("Logged in!")}
  onError={(error) => console.error(error)}
/>
```

## Hooks

For headless auth logic:

```tsx
import { useMagicLinkRequest } from "@feel-good/features/auth/hooks"

function CustomLoginForm() {
  const { email, setEmail, status, error, submit } =
    useMagicLinkRequest(authClient)

  // Build your own UI
}
```

Available hooks:
- `usePasswordSignIn` — Email + password sign in
- `usePasswordSignUp` — Registration with password
- `useMagicLinkRequest` — Request magic link email
- `useForgotPassword` — Request password reset
- `useResetPassword` — Set new password with token
- `useAuthClient` — Access auth client from context

## Naming Conventions

- **Hooks** use "SignIn/SignUp" to match the Better Auth client API methods (`signIn.email`, `signUp.email`)
- **UI components** (forms, views, blocks) use "Login/SignUp" for user-facing terminology
- **Routes** use kebab-case `/sign-in` and `/sign-up`

## Security

- Error messages don't reveal account existence (user enumeration protection)
- Status ref guards prevent double-submission
- Redirect URLs validated against allowed origins

## Accessibility

- WCAG 2.2 compliant forms
- Proper `aria-` attributes for screen readers
- Correct `autoComplete` values for password managers
- Keyboard navigation support
