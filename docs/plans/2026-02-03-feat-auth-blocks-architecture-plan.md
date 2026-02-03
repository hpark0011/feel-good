---
title: "feat: Auth Blocks Architecture"
type: feat
date: 2026-02-03
brainstorm: docs/brainstorms/2026-02-03-auth-package-architecture-brainstorm.md
deepened: 2026-02-03
---

# ✨ feat: Auth Blocks Architecture

## Enhancement Summary

**Deepened on:** 2026-02-03
**Research agents used:** 12 (Vercel React, Form Builder, TypeScript Reviewer, Architecture Strategist, Security Sentinel, Simplicity Reviewer, Pattern Recognition, Race Condition Reviewer, Best Practices Researcher, Framework Docs, Provider Pattern Learning, Tailwind Learning)

### Key Improvements
1. **Security hardening** — Fixed user enumeration vulnerability, added CSRF guidance, token security
2. **Race condition prevention** — Added guards for concurrent auth, double-click, unmounted components
3. **Type safety** — Discriminated unions, structured errors, FC over ComponentType
4. **Performance patterns** — Functional setState, useLatest, dynamic imports, preloading
5. **Accessibility** — WCAG 2.2 compliance, proper ARIA, autocomplete attributes
6. **Simplified alternative** — Option to use 2-layer architecture if 4 layers is overkill

### New Considerations Discovered
- Auth client should use singleton pattern with caching
- Apps need `@source` directive for features package in Tailwind
- Consider AuthProvider context as alternative to prop drilling
- Forms should coordinate loading states to prevent concurrent submissions

---

## Overview

Refactor `@feel-good/features/auth` into a four-layer architecture (blocks → forms → views → hooks) with UI Factory design patterns, preview mode support, and slot-based customization.

**Goal:** Enable any monorepo app to add auth with a single line: `<LoginBlock authClient={authClient} />`

## Problem Statement

The current auth package has a flat component structure that:
- Requires apps to compose forms, OAuth, and layout manually
- Uses outdated styling (not matching UI Factory design system)
- Cannot render in UI Factory without a real auth backend
- Has no clear separation between logic and presentation

## Proposed Solution

Implement a layered architecture with four abstraction levels:

| Layer | Purpose | Example |
|-------|---------|---------|
| **Blocks** | Page-level sections, complete UX | `<LoginBlock />` |
| **Forms** | Complete forms with logic | `<PasswordLoginForm />` |
| **Views** | Pure UI, no logic | `<PasswordLoginView />` |
| **Hooks** | Headless state & logic | `usePasswordSignIn()` |

Apps choose their abstraction level:
- Most apps use **blocks** (drop-in, zero config)
- Custom layouts use **forms** (compose manually)
- Fully custom UI uses **hooks** (bring your own UI)

### Research Insights: Architecture Decision

**Simplicity Review Finding:** The 4-layer architecture (22 files) may be over-engineered for 3 apps. Consider a simpler 2-layer alternative:

| Approach | Files | Best For |
|----------|-------|----------|
| **4-layer** (blocks, forms, views, hooks) | ~22 | Many consumers, deep customization needs |
| **2-layer** (hooks, components) | ~10 | Few consumers, simple customization |

**Recommendation:** Start with 4 layers as planned — the separation enables testing, preview mode, and future flexibility. Revisit if maintenance burden is high.

---

## Technical Approach

### Target Directory Structure

```
packages/features/auth/
├── blocks/                         # Layer 1: Page sections
│   ├── index.ts
│   ├── login-block.tsx
│   ├── sign-up-block.tsx
│   ├── forgot-password-block.tsx
│   ├── reset-password-block.tsx
│   └── shared/
│       ├── index.ts
│       ├── auth-section.tsx
│       ├── auth-section-header.tsx
│       └── auth-divider.tsx
│
├── components/
│   ├── forms/                      # Layer 2: Container components
│   │   ├── index.ts
│   │   ├── password-login-form.tsx
│   │   ├── magic-link-login-form.tsx
│   │   ├── password-sign-up-form.tsx
│   │   ├── magic-link-sign-up-form.tsx
│   │   ├── forgot-password-form.tsx
│   │   └── reset-password-form.tsx
│   │
│   ├── views/                      # Layer 3: Pure UI components
│   │   ├── index.ts
│   │   ├── password-login-view.tsx
│   │   ├── magic-link-login-view.tsx
│   │   ├── password-sign-up-view.tsx
│   │   ├── magic-link-sign-up-view.tsx
│   │   ├── forgot-password-view.tsx
│   │   └── reset-password-view.tsx
│   │
│   ├── shared/                     # Shared pieces
│   │   ├── index.ts
│   │   ├── oauth-buttons.tsx
│   │   ├── form-error.tsx
│   │   └── form-success.tsx
│   │
│   └── index.ts                    # Compatibility re-exports
│
├── hooks/                          # Layer 4: Headless logic
│   ├── index.ts
│   ├── use-password-sign-in.ts
│   ├── use-password-sign-up.ts
│   ├── use-magic-link-request.ts
│   ├── use-forgot-password.ts
│   ├── use-reset-password.ts
│   └── use-auth-client.ts          # NEW: Context-based client access
│
├── providers/                      # NEW: React context providers
│   ├── index.ts
│   └── auth-provider.tsx
│
├── _lib/                           # NEW: Internal utilities
│   └── schemas/
│       └── auth.schema.ts          # Zod validation schemas
│
├── client.ts                       # Auth client factory (UPDATED)
├── server.ts                       # Server utilities (unchanged)
├── types.ts                        # Shared types (UPDATED)
└── index.ts                        # Root barrel exports
```

### Research Insights: Directory Structure

**Pattern Recognition Finding:** Add `_lib/schemas/` for Zod validation schemas shared across forms. This follows the react-form-builder skill pattern.

**Provider Pattern Finding:** Add `providers/` directory with `AuthProvider` for context-based client access, reducing prop drilling.

### Package.json Exports

```json
{
  "exports": {
    "./auth": "./auth/index.ts",
    "./auth/blocks": "./auth/blocks/index.ts",
    "./auth/components/forms": "./auth/components/forms/index.ts",
    "./auth/components/views": "./auth/components/views/index.ts",
    "./auth/components/shared": "./auth/components/shared/index.ts",
    "./auth/components": "./auth/components/index.ts",
    "./auth/hooks": "./auth/hooks/index.ts",
    "./auth/providers": "./auth/providers/index.ts",
    "./auth/client": "./auth/client.ts",
    "./auth/server": "./auth/server.ts",
    "./auth/types": "./auth/types.ts"
  }
}
```

---

## Implementation Phases

### Phase 1: Foundation — Hooks & Types

Extract auth logic into headless hooks and extend type definitions.

#### 1.1 Extract Hooks from Existing Forms

**Files to create:**

| File | Source | Logic to Extract |
|------|--------|------------------|
| `hooks/use-password-sign-in.ts` | `sign-in-form.tsx` | email, password, status, error, submit |
| `hooks/use-password-sign-up.ts` | `sign-up-form.tsx` | name, email, password, status, error, submit |
| `hooks/use-magic-link-request.ts` | `magic-link-form.tsx` | email, status, error, submit |
| `hooks/use-forgot-password.ts` | `forgot-password-form.tsx` | email, status, error, submit |
| `hooks/use-reset-password.ts` | `reset-password-form.tsx` | password, confirmPassword, status, error, submit |

#### Research Insights: Hook Implementation

**Vercel Best Practices:** Use functional setState for stable callbacks:

```typescript
// hooks/use-password-sign-in.ts
"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import type { AuthClient, AuthStatus, AuthError } from "../types"
import { getAuthErrorMessage } from "../types"

export interface UsePasswordSignInOptions {
  redirectTo?: string
  onSuccess?: () => void
  onError?: (error: AuthError) => void
}

export interface UsePasswordSignInReturn {
  // Form state
  email: string
  setEmail: (value: string) => void
  password: string
  setPassword: (value: string) => void

  // Status - use discriminated union, not multiple booleans
  status: AuthStatus
  error: AuthError | null

  // Derived state for convenience
  isLoading: boolean
  isSuccess: boolean
  isError: boolean

  // Actions
  submit: () => Promise<void>
  reset: () => void
}

export function usePasswordSignIn(
  authClient: AuthClient,
  options: UsePasswordSignInOptions = {}
): UsePasswordSignInReturn {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [status, setStatus] = useState<AuthStatus>("idle")
  const [error, setError] = useState<AuthError | null>(null)

  // Race condition prevention: track if component is mounted
  const isMountedRef = useRef(true)
  useEffect(() => {
    isMountedRef.current = true
    return () => { isMountedRef.current = false }
  }, [])

  const submit = useCallback(async () => {
    // Guard against double-submission
    if (status === "loading") return

    setError(null)
    setStatus("loading")

    await authClient.signIn.email(
      { email, password },
      {
        onSuccess: () => {
          if (!isMountedRef.current) return
          setStatus("success")
          options.onSuccess?.()
        },
        onError: (ctx) => {
          if (!isMountedRef.current) return
          const authError: AuthError = {
            code: ctx.error.code ?? "UNKNOWN",
            message: getAuthErrorMessage(ctx.error.code ?? "UNKNOWN"),
            status: ctx.error.status,
          }
          setStatus("error")
          setError(authError)
          options.onError?.(authError)
        },
      }
    )
  }, [email, password, authClient, options, status])

  const reset = useCallback(() => {
    setEmail("")
    setPassword("")
    setStatus("idle")
    setError(null)
  }, [])

  return {
    email, setEmail,
    password, setPassword,
    status, error,
    isLoading: status === "loading",
    isSuccess: status === "success",
    isError: status === "error",
    submit, reset,
  }
}
```

**Key improvements from research:**
- `isMountedRef` prevents state updates on unmounted components
- Guard in `submit` prevents double-click race condition
- Structured `AuthError` instead of string
- Derived booleans for convenience, but status is the source of truth

#### 1.2 Extend Types

**File:** `types.ts`

```typescript
// Add to existing types.ts
import type { ComponentType, FC } from "react"

// Structured error type (Security + TypeScript review)
export interface AuthError {
  code: string
  message: string
  status?: number
  field?: string  // For form validation errors
}

export type AuthMode = "default" | "preview"
export type AuthStatus = "idle" | "loading" | "success" | "error"

// Use discriminated unions for mode-dependent props (TypeScript review)
interface LiveFormProps {
  mode?: "default"
  authClient: AuthClient
  redirectTo?: string
  onSuccess?: () => void
  onError?: (error: AuthError) => void
}

interface PreviewFormProps {
  mode: "preview"
  authClient?: never  // Not needed in preview
  redirectTo?: string
  onSuccess?: () => void
  onError?: (error: AuthError) => void
}

export type BaseFormProps = LiveFormProps | PreviewFormProps

// Use FC instead of ComponentType for hooks-only codebase (TypeScript review)
export interface LoginBlockSlots {
  /** @default PasswordLoginForm */
  passwordForm?: FC<PasswordLoginFormProps>
  /** @default MagicLinkLoginForm */
  magicLinkForm?: FC<MagicLinkLoginFormProps>
  /** @default OAuthButtons */
  oauthButtons?: FC<OAuthButtonsProps>
}

export interface LoginBlockProps extends BaseFormProps {
  signUpHref?: string
  forgotPasswordHref?: string
  /** Slot overrides for custom components */
  slots?: LoginBlockSlots
}

export interface SignUpBlockProps extends BaseFormProps {
  signInHref?: string
  slots?: {
    passwordForm?: FC<PasswordSignUpFormProps>
    magicLinkForm?: FC<MagicLinkSignUpFormProps>
    oauthButtons?: FC<OAuthButtonsProps>
  }
}

// Security fix: Generic error messages to prevent user enumeration
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Invalid email or password",
  USER_NOT_FOUND: "Invalid email or password",  // CHANGED: Same as invalid credentials
  EMAIL_NOT_VERIFIED: "Please verify your email before signing in",
  EMAIL_ALREADY_EXISTS: "Unable to create account. Please try signing in instead.",  // CHANGED: Vague
  INVALID_TOKEN: "This link is invalid or has expired",
  RATE_LIMITED: "Too many attempts. Please try again later.",
  PASSWORD_TOO_SHORT: "Password must be at least 8 characters",
  UNKNOWN: "An error occurred. Please try again.",
}
```

#### Research Insights: Type Safety

**TypeScript Reviewer Findings:**
1. Use `FC` instead of `ComponentType` (prevents class components in hooks-only codebase)
2. Use discriminated unions for mode-dependent props
3. Rename `components` to `slots` (established pattern name)
4. Export slot component props so consumers can type their overrides

**Security Sentinel Finding:**
- `USER_NOT_FOUND` and `EMAIL_ALREADY_EXISTS` messages enable user enumeration
- Use generic messages that don't reveal account existence

#### 1.3 Update Auth Client with Singleton Pattern

**File:** `client.ts`

```typescript
// client.ts - Auth client factory with singleton pattern (Provider Pattern Learning)
"use client"

import { createAuthClient } from "better-auth/react"
import { convexClient } from "@convex-dev/better-auth/client/plugins"
import { magicLinkClient } from "better-auth/client/plugins"

export type AuthClient = ReturnType<typeof createAuthClient>

const clientCache = new Map<string, AuthClient>()

export function getAuthClient(baseURL?: string): AuthClient {
  const url = baseURL ?? process.env.NEXT_PUBLIC_AUTH_URL

  if (!url) {
    throw new Error(
      "Missing baseURL parameter or NEXT_PUBLIC_AUTH_URL environment variable.\n\n" +
      "Set this in your .env.local file:\n" +
      '  NEXT_PUBLIC_AUTH_URL="http://localhost:3001"'
    )
  }

  // Return cached instance if exists
  if (clientCache.has(url)) {
    return clientCache.get(url)!
  }

  const client = createAuthClient({
    baseURL: url,
    plugins: [convexClient(), magicLinkClient()],
  })

  clientCache.set(url, client)
  return client
}

// Legacy export for backwards compatibility
export const createAppAuthClient = getAuthClient
```

#### 1.4 Add Auth Provider (Optional Context Pattern)

**File:** `providers/auth-provider.tsx`

```typescript
"use client"

import { createContext, useContext, type ReactNode } from "react"
import { getAuthClient, type AuthClient } from "../client"

const AuthClientContext = createContext<AuthClient | null>(null)

interface AuthProviderProps {
  children: ReactNode
  baseURL?: string
}

export function AuthProvider({ children, baseURL }: AuthProviderProps) {
  const client = getAuthClient(baseURL)
  return (
    <AuthClientContext.Provider value={client}>
      {children}
    </AuthClientContext.Provider>
  )
}

export function useAuthClient(): AuthClient {
  const client = useContext(AuthClientContext)
  if (!client) {
    throw new Error("useAuthClient must be used within AuthProvider")
  }
  return client
}
```

#### 1.5 Add Zod Validation Schemas

**File:** `_lib/schemas/auth.schema.ts`

```typescript
import { z } from "zod"

export const PASSWORD_MIN_LENGTH = 8

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address")

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name is too long")

export const PasswordLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
})

export const MagicLinkSchema = z.object({
  email: emailSchema,
})

export const PasswordSignUpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
})

export const ForgotPasswordSchema = z.object({
  email: emailSchema,
})

export const ResetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export type PasswordLoginData = z.infer<typeof PasswordLoginSchema>
export type MagicLinkData = z.infer<typeof MagicLinkSchema>
export type PasswordSignUpData = z.infer<typeof PasswordSignUpSchema>
export type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>
export type ResetPasswordData = z.infer<typeof ResetPasswordSchema>
```

#### 1.6 Create Hook Index

**File:** `hooks/index.ts`

```typescript
export { usePasswordSignIn, type UsePasswordSignInOptions, type UsePasswordSignInReturn } from "./use-password-sign-in"
export { usePasswordSignUp, type UsePasswordSignUpOptions, type UsePasswordSignUpReturn } from "./use-password-sign-up"
export { useMagicLinkRequest, type UseMagicLinkRequestOptions, type UseMagicLinkRequestReturn } from "./use-magic-link-request"
export { useForgotPassword, type UseForgotPasswordOptions, type UseForgotPasswordReturn } from "./use-forgot-password"
export { useResetPassword, type UseResetPasswordOptions, type UseResetPasswordReturn } from "./use-reset-password"
export { useAuthClient } from "./use-auth-client"

// Re-export existing session hook
export { createUseSession } from "./use-session"
```

---

### Phase 2: Views — Pure UI Components

Create pure presentation components matching UI Factory design.

#### 2.1 Port Views from UI Factory

**Source files (UI Factory):**
- `apps/ui-factory/app/blocks/login/_components/password-login-form.tsx`
- `apps/ui-factory/app/blocks/login/_components/magic-link-login-form.tsx`
- `apps/ui-factory/app/blocks/sign-up/_components/password-sign-up-form.tsx`
- `apps/ui-factory/app/blocks/sign-up/_components/magic-link-sign-up-form.tsx`

**Target files (features/auth):**
- `components/views/password-login-view.tsx`
- `components/views/magic-link-login-view.tsx`
- `components/views/password-sign-up-view.tsx`
- `components/views/magic-link-sign-up-view.tsx`
- `components/views/forgot-password-view.tsx`
- `components/views/reset-password-view.tsx`

#### Research Insights: Accessible View Pattern

**Accessibility Best Practices (WCAG 2.2):**

```typescript
// components/views/password-login-view.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@feel-good/ui/primitives/card"
import { Field, FieldGroup, FieldLabel } from "@feel-good/ui/primitives/field"
import { Input } from "@feel-good/ui/primitives/input"
import { Button } from "@feel-good/ui/primitives/button"
import { Alert, AlertDescription } from "@feel-good/ui/primitives/alert"
import Link from "next/link"
import type { AuthStatus, AuthError } from "../../types"

export interface PasswordLoginViewProps {
  // Form state (controlled)
  email: string
  password: string
  status: AuthStatus
  error: AuthError | null

  // Handlers
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: () => void

  // Links
  forgotPasswordHref?: string
}

export function PasswordLoginView({
  email,
  password,
  status,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  forgotPasswordHref,
}: PasswordLoginViewProps) {
  const isLoading = status === "loading"

  return (
    <Card className="w-full max-w-md rounded-4xl p-4 py-8 pb-10 border-transparent">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
          className="space-y-4"
          aria-describedby={error ? "form-error" : undefined}
        >
          {/* Error announcement for screen readers */}
          {error ? (
            <Alert variant="destructive" role="alert" aria-live="polite" id="form-error">
              <AlertDescription>{error.message}</AlertDescription>
            </Alert>
          ) : null}

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="login-email">
                Email <span className="text-destructive" aria-hidden="true">*</span>
              </FieldLabel>
              <Input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                variant="underline"
                autoComplete="email"
                aria-required="true"
                aria-invalid={error?.field === "email"}
                disabled={isLoading}
                data-testid="auth.login.email-input"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="login-password">
                Password <span className="text-destructive" aria-hidden="true">*</span>
              </FieldLabel>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                variant="underline"
                autoComplete="current-password"
                aria-required="true"
                aria-invalid={error?.field === "password"}
                disabled={isLoading}
                data-testid="auth.login.password-input"
              />
            </Field>
          </FieldGroup>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isLoading}
            aria-busy={isLoading}
            data-testid="auth.login.submit-btn"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>

          {forgotPasswordHref ? (
            <div className="text-center">
              <Link
                href={forgotPasswordHref}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                Forgot password?
              </Link>
            </div>
          ) : null}
        </form>
      </CardContent>
    </Card>
  )
}
```

**Key accessibility improvements:**
- `aria-describedby` links form to error message
- `role="alert"` and `aria-live="polite"` for error announcements
- `aria-required` on required fields
- `aria-invalid` on fields with errors
- `aria-busy` on submit button during loading
- Proper `autoComplete` values (`email`, `current-password`, `new-password`)
- Consistent `data-testid` pattern for E2E testing

#### 2.2 Update Shared Components

**File:** `components/shared/oauth-buttons.tsx`

```typescript
export interface OAuthButtonsProps {
  authClient?: AuthClient
  mode?: AuthMode
  label?: string
  variant?: "outline" | "secondary"
  size?: "default" | "lg"
  redirectTo?: string
  onError?: (error: AuthError) => void
}

export function OAuthButtons({
  authClient,
  mode = "default",
  label = "Continue with Google",
  variant = "outline",
  size = "lg",
  redirectTo,
  onError,
}: OAuthButtonsProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleGoogleSignIn() {
    if (mode === "preview") return
    if (!authClient) return

    setIsLoading(true)

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: redirectTo,
      })
      // If we reach here without redirect, reset loading
      // (OAuth might open popup that user closes)
      setTimeout(() => setIsLoading(false), 5000)
    } catch (e) {
      setIsLoading(false)
      onError?.({
        code: "OAUTH_ERROR",
        message: "Unable to sign in with Google. Please try again.",
      })
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className="w-full"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      aria-busy={isLoading}
      data-testid="auth.oauth.google-btn"
    >
      <GoogleIcon className="mr-2 h-4 w-4" aria-hidden="true" />
      {isLoading ? "Redirecting..." : label}
    </Button>
  )
}
```

**Research Insight:** OAuth buttons need timeout recovery — if popup is closed without completing auth, reset loading state after 5 seconds.

#### 2.3 Create Views Index

**File:** `components/views/index.ts`

```typescript
export { PasswordLoginView, type PasswordLoginViewProps } from "./password-login-view"
export { MagicLinkLoginView, type MagicLinkLoginViewProps } from "./magic-link-login-view"
export { PasswordSignUpView, type PasswordSignUpViewProps } from "./password-sign-up-view"
export { MagicLinkSignUpView, type MagicLinkSignUpViewProps } from "./magic-link-sign-up-view"
export { ForgotPasswordView, type ForgotPasswordViewProps } from "./forgot-password-view"
export { ResetPasswordView, type ResetPasswordViewProps } from "./reset-password-view"
```

---

### Phase 3: Forms — Container Components

Create container components that wire hooks to views.

#### 3.1 Create Form Containers

**Pattern:** Each form container:
1. Checks `mode` prop
2. If `mode="preview"`: render view with no-op handlers
3. If `mode="default"`: use hook, pass state to view

```typescript
// components/forms/password-login-form.tsx
"use client"

import { usePasswordSignIn } from "../../hooks"
import { PasswordLoginView } from "../views"
import type { AuthClient, AuthMode, AuthError } from "../../types"

export interface PasswordLoginFormProps {
  authClient?: AuthClient
  mode?: AuthMode
  redirectTo?: string
  forgotPasswordHref?: string
  onSuccess?: () => void
  onError?: (error: AuthError) => void
}

export function PasswordLoginForm({
  authClient,
  mode = "default",
  ...options
}: PasswordLoginFormProps) {
  // Preview mode — static rendering
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
        forgotPasswordHref={options.forgotPasswordHref}
      />
    )
  }

  // Production mode — real auth
  if (!authClient) {
    throw new Error("PasswordLoginForm requires authClient in production mode")
  }

  const {
    email, setEmail,
    password, setPassword,
    status, error,
    submit
  } = usePasswordSignIn(authClient, options)

  return (
    <PasswordLoginView
      email={email}
      password={password}
      status={status}
      error={error}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={submit}
      forgotPasswordHref={options.forgotPasswordHref}
    />
  )
}
```

**Forms to create:**
- `password-login-form.tsx`
- `magic-link-login-form.tsx`
- `password-sign-up-form.tsx`
- `magic-link-sign-up-form.tsx`
- `forgot-password-form.tsx`
- `reset-password-form.tsx`

#### 3.2 Create Forms Index

**File:** `components/forms/index.ts`

```typescript
export { PasswordLoginForm, type PasswordLoginFormProps } from "./password-login-form"
export { MagicLinkLoginForm, type MagicLinkLoginFormProps } from "./magic-link-login-form"
export { PasswordSignUpForm, type PasswordSignUpFormProps } from "./password-sign-up-form"
export { MagicLinkSignUpForm, type MagicLinkSignUpFormProps } from "./magic-link-sign-up-form"
export { ForgotPasswordForm, type ForgotPasswordFormProps } from "./forgot-password-form"
export { ResetPasswordForm, type ResetPasswordFormProps } from "./reset-password-form"
```

---

### Phase 4: Blocks — Page Sections

Create high-level block components for drop-in auth.

#### 4.1 Create Layout Helpers

**File:** `blocks/shared/auth-section.tsx`

```typescript
export function AuthSection({ children }: { children: React.ReactNode }) {
  return <div className="space-y-4">{children}</div>
}
```

**File:** `blocks/shared/auth-section-header.tsx`

```typescript
export function AuthSectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-medium text-center text-muted-foreground">
      {children}
    </h2>
  )
}
```

**File:** `blocks/shared/auth-divider.tsx`

```typescript
export function AuthDivider({ children = "or" }: { children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-border" />
      <span className="text-sm text-muted-foreground">{children}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  )
}
```

#### 4.2 Create LoginBlock with Race Condition Prevention

**File:** `blocks/login-block.tsx`

```typescript
"use client"

import { useState } from "react"
import { PasswordLoginForm } from "../components/forms"
import { MagicLinkLoginForm } from "../components/forms"
import { OAuthButtons } from "../components/shared"
import { AuthSection, AuthSectionHeader, AuthDivider } from "./shared"
import type { LoginBlockProps, AuthStatus } from "../types"

export function LoginBlock({
  authClient,
  mode = "default",
  signUpHref = "/sign-up",
  forgotPasswordHref = "/forgot-password",
  redirectTo,
  onSuccess,
  onError,
  slots,
}: LoginBlockProps) {
  // Coordinate auth state across all forms (Race Condition Prevention)
  const [globalStatus, setGlobalStatus] = useState<AuthStatus>("idle")
  const isAnyLoading = globalStatus === "loading"

  const PasswordForm = slots?.passwordForm ?? PasswordLoginForm
  const MagicLinkForm = slots?.magicLinkForm ?? MagicLinkLoginForm
  const OAuth = slots?.oauthButtons ?? OAuthButtons

  const formProps = {
    authClient,
    mode,
    redirectTo,
    onSuccess: () => {
      setGlobalStatus("success")
      onSuccess?.()
    },
    onError: (error) => {
      setGlobalStatus("error")
      onError?.(error)
    },
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <AuthSection>
        <AuthSectionHeader>Sign in with password</AuthSectionHeader>
        <PasswordForm
          {...formProps}
          forgotPasswordHref={forgotPasswordHref}
          // Disable if another auth method is loading
          disabled={isAnyLoading}
        />
      </AuthSection>

      <AuthDivider />

      <AuthSection>
        <AuthSectionHeader>Sign in with magic link</AuthSectionHeader>
        <MagicLinkForm {...formProps} disabled={isAnyLoading} />
      </AuthSection>

      <AuthDivider />

      <AuthSection>
        <OAuth
          authClient={authClient}
          mode={mode}
          redirectTo={redirectTo}
          disabled={isAnyLoading}
        />
      </AuthSection>

      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <a href={signUpHref} className="underline hover:text-foreground">
          Sign up
        </a>
      </p>
    </div>
  )
}
```

**Research Insight (Race Conditions):**
- Lift auth state to block level to coordinate all forms
- Disable other auth methods while one is loading
- Prevents user from triggering multiple concurrent auth attempts

#### 4.3 Create SignUpBlock

**File:** `blocks/sign-up-block.tsx`

Similar structure to LoginBlock, with:
- PasswordSignUpForm (includes name field)
- MagicLinkSignUpForm
- OAuthButtons
- Link to sign-in page

#### 4.4 Create ForgotPasswordBlock & ResetPasswordBlock

Simpler blocks with single form each.

#### 4.5 Create Blocks Index

**File:** `blocks/index.ts`

```typescript
export { LoginBlock } from "./login-block"
export { SignUpBlock } from "./sign-up-block"
export { ForgotPasswordBlock } from "./forgot-password-block"
export { ResetPasswordBlock } from "./reset-password-block"

// Re-export types
export type { LoginBlockProps, SignUpBlockProps, ForgotPasswordBlockProps, ResetPasswordBlockProps } from "../types"

// Layout helpers
export { AuthSection, AuthSectionHeader, AuthDivider } from "./shared"
```

---

### Phase 5: Migration — Update Consumers

#### 5.1 Update Tailwind Configuration

**Research Insight (Tailwind Learning):** Apps must add `@source` directive for features package.

**File:** `apps/mirror/styles/globals.css`

```css
/* Add features package to content sources */
@source "../node_modules/@feel-good/ui";
@source "../node_modules/@feel-good/features";
```

**File:** `apps/ui-factory/styles/globals.css`

```css
/* Add features package to content sources */
@source "../node_modules/@feel-good/ui";
@source "../node_modules/@feel-good/features";
```

#### 5.2 Update UI Factory

**File:** `apps/ui-factory/app/blocks/login/page.tsx`

```typescript
import { LoginBlock } from "@feel-good/features/auth/blocks"

export default function LoginPage() {
  return <LoginBlock mode="preview" />
}
```

**File:** `apps/ui-factory/app/blocks/sign-up/page.tsx`

```typescript
import { SignUpBlock } from "@feel-good/features/auth/blocks"

export default function SignUpPage() {
  return <SignUpBlock mode="preview" />
}
```

**Delete:** Local components in `_components/` and `_views/` directories.

#### 5.3 Update Mirror App

**File:** `apps/mirror/app/(auth)/sign-in/page.tsx`

```typescript
import { LoginBlock } from "@feel-good/features/auth/blocks"
import { authClient } from "@/lib/auth-client"

export default function SignInPage() {
  return (
    <LoginBlock
      authClient={authClient}
      signUpHref="/sign-up"
      forgotPasswordHref="/forgot-password"
      redirectTo="/dashboard"
    />
  )
}
```

**File:** `apps/mirror/app/(auth)/sign-up/page.tsx`

```typescript
import { SignUpBlock } from "@feel-good/features/auth/blocks"
import { authClient } from "@/lib/auth-client"

export default function SignUpPage() {
  return (
    <SignUpBlock
      authClient={authClient}
      signInHref="/sign-in"
      redirectTo="/dashboard"
    />
  )
}
```

**File:** `apps/mirror/app/(auth)/layout.tsx`

Remove inner card wrapper (blocks provide their own cards):

```typescript
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {children}
    </div>
  )
}
```

#### 5.4 Compatibility Layer

**File:** `components/index.ts`

Re-export for backwards compatibility:

```typescript
// Compatibility exports for existing consumers
// DEPRECATED: Use @feel-good/features/auth/blocks instead

export { PasswordLoginForm as SignInForm } from "./forms"
export { PasswordSignUpForm as SignUpForm } from "./forms"
export { MagicLinkLoginForm as MagicLinkForm } from "./forms"
export { ForgotPasswordForm } from "./forms"
export { ResetPasswordForm } from "./forms"
export { OAuthButtons } from "./shared"
export { FormError } from "./shared"
export { FormSuccess } from "./shared"
export { createSessionProvider } from "./session-provider"
```

---

### Phase 6: Documentation & Cleanup

#### 6.1 Update Package Exports

**File:** `packages/features/package.json`

Add new export paths (see Technical Approach section).

#### 6.2 Create README

**File:** `packages/features/auth/README.md`

```markdown
# @feel-good/features/auth

Pluggable auth components for Feel Good apps.

## Quick Start

\`\`\`tsx
import { LoginBlock } from "@feel-good/features/auth/blocks"
import { authClient } from "@/lib/auth-client"

export default function LoginPage() {
  return <LoginBlock authClient={authClient} />
}
\`\`\`

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

\`\`\`tsx
<LoginBlock
  authClient={authClient}
  signUpHref="/sign-up"
  forgotPasswordHref="/forgot-password"
  redirectTo="/dashboard"
  onSuccess={() => console.log("Logged in!")}
  onError={(error) => console.error(error)}
/>
\`\`\`

## Slot Overrides

\`\`\`tsx
<LoginBlock
  authClient={authClient}
  slots={{
    passwordForm: MyCustomPasswordForm,
    oauthButtons: MyCustomOAuthButtons,
  }}
/>
\`\`\`

## Preview Mode (UI Factory)

\`\`\`tsx
<LoginBlock mode="preview" />
\`\`\`

## Alternative: Context Provider

Instead of passing `authClient` as a prop, wrap your app with `AuthProvider`:

\`\`\`tsx
// app/layout.tsx
import { AuthProvider } from "@feel-good/features/auth/providers"

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  )
}

// Then blocks can use useAuthClient() internally
\`\`\`
```

#### 6.3 Update CLAUDE.md

Add to packages section:

```markdown
### Auth Package Layers

| Layer | Import | Purpose |
|-------|--------|---------|
| Blocks | `@feel-good/features/auth/blocks` | Drop-in page sections |
| Forms | `@feel-good/features/auth/components/forms` | Complete forms with logic |
| Views | `@feel-good/features/auth/components/views` | Pure UI components |
| Hooks | `@feel-good/features/auth/hooks` | Headless auth logic |
| Providers | `@feel-good/features/auth/providers` | Context providers |
```

---

## Acceptance Criteria

### Functional Requirements

- [x] `LoginBlock` renders stacked Password + Magic Link + OAuth sections
- [x] `SignUpBlock` renders stacked sections with name field
- [x] `mode="preview"` renders forms without authClient
- [x] Password sign-in flow works end-to-end
- [x] Password sign-up flow works end-to-end
- [x] Magic link request flow works
- [x] Google OAuth flow works
- [x] Forgot password flow works
- [x] Reset password flow works
- [x] Slot overrides allow component replacement
- [x] Navigation links work (sign-up, sign-in, forgot password)

### Non-Functional Requirements

- [x] `pnpm lint --filter=@feel-good/features` passes
- [x] `pnpm build --filter=@feel-good/mirror` succeeds
- [x] `pnpm build --filter=@feel-good/ui-factory` succeeds
- [x] No TypeScript errors
- [x] Existing Mirror auth pages work after migration

### Quality Gates

- [x] All hooks are unit testable (no JSX dependencies)
- [x] All views are pure components (no side effects)
- [x] Backwards compatibility maintained via re-exports
- [x] README documents all abstraction levels

### Security Requirements (from Security Sentinel)

- [x] Error messages do not reveal account existence
- [x] Reset password tokens handled securely
- [x] CSRF protection verified via Better Auth config
- [x] Rate limiting in place for all auth endpoints

### Accessibility Requirements (from Best Practices Research)

- [x] All forms have proper `aria-` attributes
- [x] Error messages announced to screen readers
- [x] Correct `autoComplete` values on all inputs
- [x] Keyboard navigation works

---

## Dependencies & Prerequisites

- Better Auth pinned to 1.4.9 (Convex compatibility)
- `@feel-good/ui` primitives available
- `@feel-good/icons` for GoogleIcon
- `zod` for validation schemas
- `@hookform/resolvers` (optional, for react-hook-form integration)

---

## Risk Analysis & Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking existing Mirror auth | Medium | High | Keep `components/index.ts` re-exports, test thoroughly |
| Preview mode edge cases | Low | Medium | Test all form interactions in preview mode |
| Styling inconsistencies | Medium | Low | Port styling directly from UI Factory |
| Race conditions | Medium | Medium | Coordinate state at block level, add guards in hooks |
| User enumeration | Low | High | Use generic error messages |

---

## References & Research

### Internal References

- Brainstorm: `docs/brainstorms/2026-02-03-auth-package-architecture-brainstorm.md`
- Current auth components: `packages/features/auth/components/`
- UI Factory blocks: `apps/ui-factory/app/blocks/login/`, `apps/ui-factory/app/blocks/sign-up/`
- Mirror auth pages: `apps/mirror/app/(auth)/`
- Provider pattern: `docs/solutions/architecture-patterns/provider-separation-of-concerns.md`
- Tailwind config: `docs/solutions/tailwind/monorepo-source-configuration.md`
- Better Auth plan: `docs/plans/completed/feat-convex-better-auth-implementation.md`

### External References

- Better Auth docs: https://better-auth.com
- Convex Better Auth: https://github.com/erquhart/convex-better-auth
- WCAG 2.2 Accessible Authentication: https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum
- React Hook Form: https://react-hook-form.com
