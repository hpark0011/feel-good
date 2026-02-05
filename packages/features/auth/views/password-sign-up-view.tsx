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
import { PASSWORD_MIN_LENGTH } from "../types";
import type { AuthError, AuthStatus } from "../types";
import { FormError } from "../components/shared/form-error";
import { FormSuccess } from "../components/shared/form-success";

export interface PasswordSignUpViewProps {
  // Form state (controlled)
  email: string;
  password: string;
  status: AuthStatus;
  error: AuthError | null;

  // Handlers
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: () => void;
}

export const PasswordSignUpView = memo(function PasswordSignUpView({
  email,
  password,
  status,
  error,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: PasswordSignUpViewProps) {
  const isLoading = status === "loading";
  const isSuccess = status === "success";

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md rounded-4xl border-transparent p-4 py-8 pb-10">
        <CardContent className="pt-6">
          <div className="space-y-4 text-center">
            <FormSuccess
              title="Check your email"
              message={`We sent a verification link to ${email}. Please verify your email to continue.`}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md rounded-4xl border-transparent p-4 py-8 pb-10">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-medium">
          Create your account
        </CardTitle>
        <CardDescription className="sr-only">
          Enter your information below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          aria-describedby={error ? "sign-up-form-error" : undefined}
        >
          <FieldGroup>
            <FormError error={error} id="sign-up-form-error" />

            <Field>
              <FieldLabel htmlFor="sign-up-email" className="px-1.5">
                Email{" "}
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </FieldLabel>
              <Input
                id="sign-up-email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                variant="underline"
                autoComplete="email"
                aria-required="true"
                aria-invalid={error?.field === "email"}
                disabled={isLoading}
                data-testid="auth.sign-up.email-input"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="sign-up-password" className="px-1.5">
                Password{" "}
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </FieldLabel>
              <Input
                id="sign-up-password"
                type="password"
                placeholder={`Min ${PASSWORD_MIN_LENGTH} characters`}
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                variant="underline"
                autoComplete="new-password"
                minLength={PASSWORD_MIN_LENGTH}
                aria-required="true"
                aria-invalid={error?.field === "password"}
                disabled={isLoading}
                data-testid="auth.sign-up.password-input"
              />
            </Field>

            <Field>
              <Button
                type="submit"
                size="lg"
                variant="primary"
                disabled={isLoading}
                aria-busy={isLoading}
                data-testid="auth.sign-up.submit-btn"
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
});
