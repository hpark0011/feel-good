"use client";

import { Button } from "@feel-good/ui/primitives/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@feel-good/ui/primitives/card";
import { Field, FieldGroup, FieldLabel } from "@feel-good/ui/primitives/field";
import { Input } from "@feel-good/ui/primitives/input";
import Link from "next/link";
import type { AuthError, AuthStatus } from "../../types";
import { FormError } from "../shared/form-error";

export interface PasswordLoginViewProps {
  // Form state (controlled)
  email: string;
  password: string;
  status: AuthStatus;
  error: AuthError | null;

  // Handlers
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;

  // Optional links
  forgotPasswordHref?: string;
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
  const isLoading = status === "loading";

  return (
    <Card className="w-full max-w-md rounded-4xl border-transparent p-4 py-8 pb-10 bg-red-500">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-medium">
          Login
        </CardTitle>
        <CardDescription className="sr-only">
          Enter your email and password to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          aria-describedby={error ? "login-form-error" : undefined}
        >
          <FieldGroup>
            <FormError error={error} id="login-form-error" />

            <Field>
              <FieldLabel htmlFor="login-email" className="px-1.5">
                Email{" "}
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </FieldLabel>
              <Input
                id="login-email"
                type="email"
                placeholder="m@example.com"
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
              <div className="flex items-center">
                <FieldLabel htmlFor="login-password" className="px-1.5">
                  Password{" "}
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                </FieldLabel>
                {forgotPasswordHref
                  ? (
                    <Link
                      href={forgotPasswordHref}
                      className="text-muted-foreground hover:text-blue-500 ml-auto pr-1.5 text-sm underline-offset-4 hover:underline leading-0"
                    >
                      Forgot your password?
                    </Link>
                  )
                  : null}
              </div>
              <Input
                id="login-password"
                type="password"
                placeholder="Enter your password"
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

            <Field>
              <Button
                type="submit"
                size="lg"
                variant="primary"
                disabled={isLoading}
                aria-busy={isLoading}
                data-testid="auth.login.submit-btn"
              >
                {isLoading ? "Signing in..." : "Login"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
