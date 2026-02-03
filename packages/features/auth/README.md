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
| `auth/components/views` | Custom logic — bring your own state |
| `auth/hooks` | Fully custom UI — headless logic only |

## Available Blocks

- `LoginBlock` — Password + Magic Link + OAuth sections
- `SignUpBlock` — Registration with password or magic link
- `ForgotPasswordBlock` — Request password reset
- `ResetPasswordBlock` — Set new password

## Configuration

```tsx
<LoginBlock
  authClient={authClient}
  signUpHref="/sign-up"
  forgotPasswordHref="/forgot-password"
  redirectTo="/dashboard"
  onSuccess={() => console.log("Logged in!")}
  onError={(error) => console.error(error)}
/>
```

## Slot Overrides

Replace default components with custom implementations:

```tsx
<LoginBlock
  authClient={authClient}
  slots={{
    passwordForm: MyCustomPasswordForm,
    oauthButtons: MyCustomOAuthButtons,
  }}
/>
```

## Preview Mode (UI Factory)

Render forms without auth backend for design system previews:

```tsx
<LoginBlock mode="preview" />
```

## Alternative: Context Provider

Instead of passing `authClient` as a prop, wrap your app with `AuthProvider`:

```tsx
// app/layout.tsx
import { AuthProvider } from "@feel-good/features/auth/providers"

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}
```

## Hooks

For headless auth logic:

```tsx
import { usePasswordSignIn } from "@feel-good/features/auth/hooks"

function CustomLoginForm() {
  const { email, setEmail, password, setPassword, status, error, submit } =
    usePasswordSignIn(authClient)

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

## Security

- Error messages don't reveal account existence (user enumeration protection)
- Race condition guards prevent double-submission
- Mounted component checks prevent state updates on unmounted components

## Accessibility

- WCAG 2.2 compliant forms
- Proper `aria-` attributes for screen readers
- Correct `autoComplete` values for password managers
- Keyboard navigation support
