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
import { PASSWORD_MIN_LENGTH } from "../../types";
import type { AuthStatus, AuthError } from "../../types";
import { FormError } from "../shared/form-error";
import { FormSuccess } from "../shared/form-success";

export interface ResetPasswordViewProps {
  // Form state (controlled)
  password: string;
  confirmPassword: string;
  status: AuthStatus;
  error: AuthError | null;

  // Token validity
  hasToken: boolean;

  // Handlers
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: () => void;

  // Links
  signInHref?: string;
  forgotPasswordHref?: string;
}

export function ResetPasswordView({
  password,
  confirmPassword,
  status,
  error,
  hasToken,
  onPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  signInHref = "/sign-in",
  forgotPasswordHref = "/forgot-password",
}: ResetPasswordViewProps) {
  const isLoading = status === "loading";
  const isSuccess = status === "success";

  // Invalid token state
  if (!hasToken) {
    return (
      <Card className="w-full max-w-md rounded-4xl border-transparent p-4 py-8 pb-10">
        <CardContent className="pt-6">
          <div className="bg-destructive/10 rounded-md p-4 text-center">
            <p className="text-destructive text-sm">
              Invalid or missing reset token. Please request a new password
              reset link.
            </p>
            <Link
              href={forgotPasswordHref}
              className="text-primary mt-2 inline-block text-sm hover:underline"
            >
              Request new link
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <Card className="w-full max-w-md rounded-4xl border-transparent p-4 py-8 pb-10">
        <CardContent className="pt-6">
          <div className="space-y-4 text-center">
            <FormSuccess
              title="Password reset successful"
              message="Your password has been reset. Redirecting to sign in..."
            />
            <Link
              href={signInHref}
              className="text-primary text-sm hover:underline"
            >
              Go to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md rounded-4xl border-transparent p-4 py-8 pb-10">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-medium">
          Reset password
        </CardTitle>
        <CardDescription className="text-muted-foreground text-center text-sm">
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
          aria-describedby={error ? "reset-password-form-error" : undefined}
        >
          <FieldGroup>
            <FormError error={error} id="reset-password-form-error" />

            <Field>
              <FieldLabel htmlFor="reset-new-password" className="px-1.5">
                New Password{" "}
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </FieldLabel>
              <Input
                id="reset-new-password"
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
                data-testid="auth.reset-password.password-input"
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="reset-confirm-password" className="px-1.5">
                Confirm Password{" "}
                <span className="text-destructive" aria-hidden="true">
                  *
                </span>
              </FieldLabel>
              <Input
                id="reset-confirm-password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => onConfirmPasswordChange(e.target.value)}
                variant="underline"
                autoComplete="new-password"
                minLength={PASSWORD_MIN_LENGTH}
                aria-required="true"
                aria-invalid={error?.field === "confirmPassword"}
                disabled={isLoading}
                data-testid="auth.reset-password.confirm-input"
              />
            </Field>

            <Field>
              <Button
                type="submit"
                size="lg"
                variant="primary"
                disabled={isLoading}
                aria-busy={isLoading}
                data-testid="auth.reset-password.submit-btn"
              >
                {isLoading ? "Resetting..." : "Reset password"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
