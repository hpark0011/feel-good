"use client";

import { usePasswordSignIn } from "../../hooks";
import { PasswordLoginView } from "../views";
import type { AuthClient } from "../../client";
import type { AuthError } from "../../types";

export interface PasswordLoginFormProps {
  authClient: AuthClient;
  redirectTo?: string;
  forgotPasswordHref?: string;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
}

export function PasswordLoginForm({
  authClient,
  forgotPasswordHref,
  disabled = false,
  ...options
}: PasswordLoginFormProps) {
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
