# Auth Package Architecture Brainstorm

**Date:** 2026-02-03
**Status:** Ready for Planning

## What We're Building

A modular authentication feature package (`@feel-good/features/auth`) that can be easily plugged into any app in the monorepo. The package uses a **four-layer architecture**: blocks → forms → views → hooks, with the UI Factory design system and an "opinionated + slots" customization pattern.

### Target Structure

```
packages/features/auth/
├── blocks/                    # Page-level compositions (drop-in sections)
│   ├── login-block.tsx
│   ├── sign-up-block.tsx
│   ├── forgot-password-block.tsx
│   ├── reset-password-block.tsx
│   └── shared/
│       ├── auth-section.tsx
│       ├── auth-section-header.tsx
│       └── auth-divider.tsx
│
├── components/
│   ├── forms/                 # Container components (hooks + views)
│   │   ├── password-login-form.tsx
│   │   ├── magic-link-login-form.tsx
│   │   ├── password-sign-up-form.tsx
│   │   ├── magic-link-sign-up-form.tsx
│   │   ├── forgot-password-form.tsx
│   │   └── reset-password-form.tsx
│   │
│   ├── views/                 # Pure UI (props only, no logic)
│   │   ├── password-login-view.tsx
│   │   ├── magic-link-login-view.tsx
│   │   ├── password-sign-up-view.tsx
│   │   ├── magic-link-sign-up-view.tsx
│   │   ├── forgot-password-view.tsx
│   │   └── reset-password-view.tsx
│   │
│   └── shared/                # Shared UI pieces
│       ├── oauth-buttons.tsx
│       ├── form-error.tsx
│       └── form-success.tsx
│
├── hooks/                     # Headless auth logic (testable, reusable)
│   ├── use-password-sign-in.ts
│   ├── use-password-sign-up.ts
│   ├── use-magic-link-request.ts
│   ├── use-forgot-password.ts
│   ├── use-reset-password.ts
│   └── index.ts
│
├── client.ts                  # createAppAuthClient() factory
├── server.ts                  # Server-side utilities
├── types.ts                   # Shared TypeScript types
└── index.ts                   # Barrel exports
```

### Export Paths

```typescript
// Blocks (page-level, recommended for most apps)
import { LoginBlock, SignUpBlock } from "@feel-good/features/auth/blocks"

// Forms (complete forms with logic)
import { PasswordLoginForm, MagicLinkLoginForm } from "@feel-good/features/auth/components/forms"

// Views (pure UI, for custom compositions)
import { PasswordLoginView } from "@feel-good/features/auth/components/views"

// Hooks (headless logic, for fully custom UI)
import { usePasswordSignIn } from "@feel-good/features/auth/hooks"

// Shared components
import { OAuthButtons, FormError, FormSuccess } from "@feel-good/features/auth/components/shared"

// Client/Server setup
import { createAppAuthClient } from "@feel-good/features/auth/client"
import { createAuthServerUtils } from "@feel-good/features/auth/server"
```

---

## Why This Approach

### Decision 1: Four-Layer Architecture

**Choice:** Blocks → Forms → Views → Hooks

| Layer | Responsibility | When to Use |
|-------|----------------|-------------|
| **Blocks** | Page-level sections, complete UX | Most apps — drop in and go |
| **Forms** | Complete forms with logic | When you need just one form type |
| **Views** | Pure UI, no logic | Custom compositions, testing |
| **Hooks** | Headless state & logic | Fully custom UI |

**Rationale:**
- Each layer has single responsibility
- Apps choose their abstraction level
- Lower layers are testable in isolation
- Higher layers provide convenience

### Decision 2: Separate Forms Per Auth Method

**Choice:** `PasswordLoginForm` and `MagicLinkLoginForm` as separate components (not `LoginForm method="password"`)

**Rationale:**
- Explicit naming is clearer than configuration
- Each method has different fields and flows
- Easier to tree-shake unused code
- Simpler component internals

### Decision 3: Stacked Cards UX

**Choice:** Login/SignUp blocks render stacked sections (Password card + Magic Link card + OAuth)

**Rationale:**
- Matches UI Factory's current design
- All options visible at once (no hidden tabs)
- Each section is self-contained
- Cleaner visual hierarchy

### Decision 4: Opinionated + Slots Pattern

**Choice:** Blocks have sensible defaults but allow component overrides via `components` prop

```typescript
// Default behavior — use built-in forms
<LoginBlock authClient={authClient} />

// Custom override — swap password form
<LoginBlock
  authClient={authClient}
  components={{
    passwordForm: MyCustomPasswordForm
  }}
/>
```

**Rationale:**
- 90% of apps use defaults (fast setup)
- 10% can override specific pieces
- No need to rebuild everything for small changes
- Future-proof without breaking API

### Decision 5: Preview Mode for UI Factory

**Choice:** Blocks accept `mode="preview"` to render without auth client

```typescript
// In UI Factory — shows UI without auth wiring
<LoginBlock mode="preview" />

// In real apps — requires auth client
<LoginBlock authClient={authClient} />
```

**Rationale:**
- UI Factory can showcase blocks without backend
- Forms render with placeholder handlers
- Design iteration without auth setup
- Same components in dev and production

### Decision 6: Factory Pattern for Auth Client

**Choice:** Keep current `createAppAuthClient(baseURL)` pattern

**Rationale:**
- Already working in Mirror app
- Explicit dependency injection
- Apps control their configuration
- No breaking changes

### Decision 7: Separate OAuth Component

**Choice:** `OAuthButtons` is standalone, composed alongside forms in blocks

**Rationale:**
- Single responsibility
- Flexible positioning
- Can be used independently
- Cleaner form components

### Decision 8: Full Auth Flow

**Choice:** Include all auth flows from the start

- Login (password + magic link)
- Sign up (password + magic link)
- Forgot password
- Reset password

**Rationale:**
- Complete auth experience out of the box
- Shared patterns across all flows
- One package for all auth needs

---

## Architecture Details

### Layer 1: Blocks (Page Sections)

Blocks are complete, drop-in page sections. They compose forms, OAuth, and layout helpers.

```typescript
// LoginBlock — complete login section
interface LoginBlockProps {
  // Required (unless preview mode)
  authClient?: AuthClient

  // Mode
  mode?: "default" | "preview"

  // Navigation
  signUpHref?: string
  forgotPasswordHref?: string
  redirectTo?: string

  // Callbacks
  onSuccess?: () => void
  onError?: (error: string) => void

  // Slot overrides
  components?: {
    passwordForm?: ComponentType<PasswordLoginFormProps>
    magicLinkForm?: ComponentType<MagicLinkLoginFormProps>
    oauthButtons?: ComponentType<OAuthButtonsProps>
  }
}

function LoginBlock({ authClient, mode, components, ...props }: LoginBlockProps) {
  const PasswordForm = components?.passwordForm ?? PasswordLoginForm
  const MagicLinkForm = components?.magicLinkForm ?? MagicLinkLoginForm
  const OAuth = components?.oauthButtons ?? OAuthButtons

  return (
    <>
      <AuthSection>
        <AuthSectionHeader>Sign in with password</AuthSectionHeader>
        <PasswordForm authClient={authClient} mode={mode} {...props} />
      </AuthSection>

      <AuthDivider>or</AuthDivider>

      <AuthSection>
        <AuthSectionHeader>Sign in with magic link</AuthSectionHeader>
        <MagicLinkForm authClient={authClient} mode={mode} {...props} />
      </AuthSection>

      <AuthDivider>or</AuthDivider>

      <AuthSection>
        <OAuth authClient={authClient} mode={mode} />
      </AuthSection>
    </>
  )
}
```

### Layer 2: Forms (Container Components)

Forms wire hooks to views. They handle state, submission, and error handling.

```typescript
// PasswordLoginForm — container component
interface PasswordLoginFormProps {
  authClient?: AuthClient
  mode?: "default" | "preview"
  redirectTo?: string
  forgotPasswordHref?: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

function PasswordLoginForm({ authClient, mode, ...props }: PasswordLoginFormProps) {
  // Preview mode — render view with no-op handlers
  if (mode === "preview") {
    return (
      <PasswordLoginView
        email=""
        password=""
        status="idle"
        error={null}
        onEmailChange={() => {}}
        onPasswordChange={() => {}}
        onSubmit={() => {}}
        {...props}
      />
    )
  }

  // Real mode — use hook for logic
  const {
    email, setEmail,
    password, setPassword,
    status, error,
    submit
  } = usePasswordSignIn(authClient!, props)

  return (
    <PasswordLoginView
      email={email}
      password={password}
      status={status}
      error={error}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={submit}
      {...props}
    />
  )
}
```

### Layer 3: Views (Pure UI)

Views are pure presentation. They receive all data and handlers as props.

```typescript
// PasswordLoginView — pure UI component
interface PasswordLoginViewProps {
  // Form state
  email: string
  password: string
  status: AuthStatus
  error: string | null

  // Handlers
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: () => void

  // Links
  forgotPasswordHref?: string
}

function PasswordLoginView({
  email, password, status, error,
  onEmailChange, onPasswordChange, onSubmit,
  forgotPasswordHref
}: PasswordLoginViewProps) {
  return (
    <Card className="max-w-md w-full rounded-4xl p-4 py-8 pb-10 border-transparent">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">
                Email <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                variant="underline"
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">
                Password <span className="text-destructive">*</span>
              </FieldLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                variant="underline"
                required
              />
            </Field>
          </FieldGroup>

          {error && <FormError message={error} />}

          <Button type="submit" disabled={status === "loading"}>
            {status === "loading" ? "Signing in..." : "Sign in"}
          </Button>

          {forgotPasswordHref && (
            <Link href={forgotPasswordHref}>Forgot password?</Link>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
```

### Layer 4: Hooks (Headless Logic)

Hooks contain all auth logic with no UI concerns.

```typescript
// usePasswordSignIn — headless hook
interface UsePasswordSignInOptions {
  redirectTo?: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

function usePasswordSignIn(authClient: AuthClient, options: UsePasswordSignInOptions = {}) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<AuthStatus>("idle")
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    setStatus("loading")
    setError(null)

    try {
      await authClient.signIn.email({
        email,
        password,
        callbackURL: options.redirectTo,
      })
      setStatus("success")
      options.onSuccess?.()
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      setStatus("error")
      options.onError?.(message)
    }
  }

  const reset = () => {
    setEmail("")
    setPassword("")
    setStatus("idle")
    setError(null)
  }

  return {
    email, setEmail,
    password, setPassword,
    status, error,
    submit, reset
  }
}
```

---

## Layout Helpers

Shared components for consistent auth page structure.

```typescript
// AuthSection — wrapper for each auth method
function AuthSection({ children }: { children: ReactNode }) {
  return <div className="space-y-4">{children}</div>
}

// AuthSectionHeader — section title
function AuthSectionHeader({ children }: { children: ReactNode }) {
  return <h2 className="text-lg font-medium text-center">{children}</h2>
}

// AuthDivider — "or" separator between sections
function AuthDivider({ children = "or" }: { children?: ReactNode }) {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-border" />
      <span className="text-sm text-muted-foreground">{children}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}
```

---

## Migration Plan

### Phase 1: Create New Structure

1. Add `blocks/` directory with layout helpers
2. Add `components/views/` with pure UI components (port from UI Factory)
3. Refactor existing `components/` into `components/forms/` (container pattern)
4. Refactor existing form logic into `hooks/`

### Phase 2: Wire Up Blocks

1. Create `LoginBlock` and `SignUpBlock` composing forms + OAuth
2. Add `mode="preview"` support
3. Create `ForgotPasswordBlock` and `ResetPasswordBlock`

### Phase 3: Update UI Factory

1. Replace `apps/ui-factory/app/blocks/login/` to use `<LoginBlock mode="preview" />`
2. Replace `apps/ui-factory/app/blocks/sign-up/` to use `<SignUpBlock mode="preview" />`
3. Delete duplicated local components

### Phase 4: Update Mirror

1. Update `apps/mirror/app/(auth)/sign-in/page.tsx` to use `<LoginBlock />`
2. Update `apps/mirror/app/(auth)/sign-up/page.tsx` to use `<SignUpBlock />`
3. Update layout to remove inner card wrapper (blocks provide their own cards)
4. Test all auth flows

### Phase 5: Documentation & Exports

1. Update `package.json` exports for new paths
2. Add README with "Add auth to a new app" guide
3. Update CLAUDE.md with new import patterns

---

## Test Scenarios

- [ ] Mirror sign-in shows stacked Password + Magic Link + OAuth sections
- [ ] Mirror sign-up shows stacked sections with Name field
- [ ] Password sign-in flow works end-to-end
- [ ] Password sign-up flow works end-to-end
- [ ] Magic link request flow works
- [ ] Google OAuth flow works
- [ ] Forgot password flow works
- [ ] Reset password flow works
- [ ] UI Factory `/blocks/login` renders in preview mode (no auth client)
- [ ] UI Factory `/blocks/sign-up` renders in preview mode
- [ ] `pnpm lint --filter=@feel-good/features` passes
- [ ] `pnpm build --filter=@feel-good/mirror` succeeds
- [ ] Slot overrides work (custom form component)

---

## Success Criteria

- [ ] Auth features plug into any monorepo app with `<LoginBlock authClient={...} />`
- [ ] Code is modular (4 clear layers)
- [ ] Variable names are explicit (`PasswordLoginForm` not `LoginForm type="password"`)
- [ ] Architecture is self-documenting via folder structure
- [ ] Single responsibility per file/component
- [ ] No repeated logic (DRY via hooks)
- [ ] Separation of concerns (blocks → forms → views → hooks)
- [ ] UI Factory can showcase without auth backend (`mode="preview"`)
- [ ] Documentation exists for onboarding new developers

---

## Assumptions

- Stacked cards (Password + Magic Link + OAuth) is the desired UX
- Name field is required on sign-up
- UI Factory uses preview mode only
- Direct subpath imports preferred for bundle efficiency
- Better Auth + Convex remains the auth stack

---

## Next Steps

Run `/workflows:plan` to create implementation tasks.
