"use client";

import { memo } from "react";
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
import type { AuthStatus, AuthError } from "../types";
import { FormError } from "../components/shared/form-error";
import { FormSuccess } from "../components/shared/form-success";

export interface ForgotPasswordViewProps {
  // Form state (controlled)
  email: string;
  status: AuthStatus;
  error: AuthError | null;

  // Handlers
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
}

export const ForgotPasswordView = memo(function ForgotPasswordView({
  email,
  status,
  error,
  onEmailChange,
  onSubmit,
}: ForgotPasswordViewProps) {
  const isLoading = status === "loading";
  const isSuccess = status === "success";

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md rounded-4xl border-transparent p-0">
        <CardContent className="pt-6">
          <div className="space-y-4 text-center">
            <FormSuccess
              title="Check your email"
              message={`If an account exists for ${email}, you will receive a password reset link.`}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md rounded-4xl border-transparent p-0">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-medium">
          Forgot password
        </CardTitle>
        <CardDescription className="text-muted-foreground text-center text-sm">
          Enter your email and we&apos;ll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          aria-describedby={error ? "forgot-password-form-error" : undefined}
        >
          <FieldGroup>
            <FormError error={error} id="forgot-password-form-error" />

            <Field>
              <FieldLabel htmlFor="forgot-password-email" className="px-1.5">
                Email{" "}
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </FieldLabel>
              <Input
                id="forgot-password-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                variant="underline"
                autoComplete="email"
                aria-required="true"
                aria-invalid={error?.field === "email"}
                disabled={isLoading}
                data-testid="auth.forgot-password.email-input"
              />
            </Field>

            <Field>
              <Button
                type="submit"
                size="lg"
                variant="primary"
                disabled={isLoading}
                aria-busy={isLoading}
                data-testid="auth.forgot-password.submit-btn"
              >
                {isLoading ? "Sending..." : "Send reset link"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
});
