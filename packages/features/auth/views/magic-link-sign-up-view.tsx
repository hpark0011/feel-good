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
import type { AuthError, AuthStatus } from "../types";
import { FormError } from "../components/shared/form-error";
import { FormSuccess } from "../components/shared/form-success";

export interface MagicLinkSignUpViewProps {
  // Form state (controlled)
  email: string;
  status: AuthStatus;
  error: AuthError | null;

  // Handlers
  onEmailChange: (value: string) => void;
  onSubmit: () => void;
  onReset?: () => void;
}

export const MagicLinkSignUpView = memo(function MagicLinkSignUpView({
  email,
  status,
  error,
  onEmailChange,
  onSubmit,
  onReset,
}: MagicLinkSignUpViewProps) {
  const isLoading = status === "loading";
  const isSuccess = status === "success";

  if (isSuccess) {
    return (
      <Card className="w-full rounded-4xl border-transparent">
        <CardContent className="p-0">
          <div className="space-y-4 text-center">
            <FormSuccess
              title="Check your email"
              message={`We sent a magic link to ${email}. Click the link to create your account.`}
            />
            {onReset
              ? (
                <Button
                  variant="ghost"
                  onClick={onReset}
                  className="text-sm"
                  data-testid="auth.magic-link-sign-up.reset-btn"
                >
                  Use a different email
                </Button>
              )
              : null}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full rounded-4xl border-transparent p-0">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-medium">
          Create your account
        </CardTitle>
        <CardDescription className="sr-only">
          Enter your email to receive a magic link to create your account
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          aria-describedby={error ? "magic-link-sign-up-form-error" : undefined}
        >
          <FieldGroup>
            <FormError error={error} id="magic-link-sign-up-form-error" />

            <Field>
              <FieldLabel htmlFor="magic-link-sign-up-email" className="px-1.5">
                Email{" "}
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </FieldLabel>
              <Input
                id="magic-link-sign-up-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                variant="underline"
                autoComplete="email"
                aria-required="true"
                aria-invalid={error?.field === "email"}
                disabled={isLoading}
                data-testid="auth.magic-link-sign-up.email-input"
              />
            </Field>

            <Field>
              <Button
                type="submit"
                size="lg"
                variant="primary"
                disabled={isLoading}
                aria-busy={isLoading}
                data-testid="auth.magic-link-sign-up.submit-btn"
              >
                {isLoading ? "Sending link..." : "Continue with Email"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
});
