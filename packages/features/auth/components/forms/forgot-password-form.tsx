"use client";

import { useForgotPassword } from "../../hooks";
import { ForgotPasswordView } from "../../views";
import type { AuthClient } from "../../client";
import type { AuthError } from "../../types";

export interface ForgotPasswordFormProps {
  authClient: AuthClient;
  redirectTo?: string;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
}

export function ForgotPasswordForm({
  authClient,
  disabled = false,
  ...options
}: ForgotPasswordFormProps) {
  const { email, setEmail, status, error, submit } = useForgotPassword(
    authClient,
    options
  );

  return (
    <ForgotPasswordView
      email={email}
      status={disabled ? "loading" : status}
      error={error}
      onEmailChange={setEmail}
      onSubmit={submit}
    />
  );
}
