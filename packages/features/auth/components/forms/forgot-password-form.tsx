"use client";

import { useForgotPassword } from "../../hooks";
import { ForgotPasswordView } from "../views";
import type { AuthClient } from "../../client";
import type { AuthMode, AuthError } from "../../types";

export interface ForgotPasswordFormProps {
  authClient?: AuthClient;
  mode?: AuthMode;
  redirectTo?: string;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
}

export function ForgotPasswordForm({
  authClient,
  mode = "default",
  disabled = false,
  ...options
}: ForgotPasswordFormProps) {
  // Preview mode — static rendering with no-op handlers
  if (mode === "preview") {
    return (
      <ForgotPasswordView
        email=""
        status="idle"
        error={null}
        onEmailChange={() => {}}
        onSubmit={() => {}}
      />
    );
  }

  // Production mode — real auth
  if (!authClient) {
    throw new Error(
      "ForgotPasswordForm requires authClient in production mode"
    );
  }

  return (
    <ForgotPasswordFormInternal
      authClient={authClient}
      disabled={disabled}
      {...options}
    />
  );
}

// Internal component that uses hooks
function ForgotPasswordFormInternal({
  authClient,
  disabled,
  ...options
}: Omit<ForgotPasswordFormProps, "mode"> & { authClient: AuthClient }) {
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
