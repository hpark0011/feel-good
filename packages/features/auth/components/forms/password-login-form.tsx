"use client";

import { usePasswordSignIn } from "../../hooks";
import { PasswordLoginView } from "../views";
import type { AuthClient } from "../../client";
import type { AuthMode, AuthError } from "../../types";

export interface PasswordLoginFormProps {
  authClient?: AuthClient;
  mode?: AuthMode;
  redirectTo?: string;
  forgotPasswordHref?: string;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
}

export function PasswordLoginForm({
  authClient,
  mode = "default",
  forgotPasswordHref,
  disabled = false,
  ...options
}: PasswordLoginFormProps) {
  // Preview mode — static rendering with no-op handlers
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
        forgotPasswordHref={forgotPasswordHref}
      />
    );
  }

  // Production mode — real auth
  if (!authClient) {
    throw new Error("PasswordLoginForm requires authClient in production mode");
  }

  return (
    <PasswordLoginFormInternal
      authClient={authClient}
      forgotPasswordHref={forgotPasswordHref}
      disabled={disabled}
      {...options}
    />
  );
}

// Internal component that uses hooks (must be separate to avoid hook rules)
function PasswordLoginFormInternal({
  authClient,
  forgotPasswordHref,
  disabled,
  ...options
}: Omit<PasswordLoginFormProps, "mode"> & { authClient: AuthClient }) {
  const { email, setEmail, password, setPassword, status, error, submit } =
    usePasswordSignIn(authClient, options);

  return (
    <PasswordLoginView
      email={email}
      password={password}
      status={disabled ? "loading" : status}
      error={error}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={submit}
      forgotPasswordHref={forgotPasswordHref}
    />
  );
}
