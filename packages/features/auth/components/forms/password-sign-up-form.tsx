"use client";

import { usePasswordSignUp } from "../../hooks";
import { PasswordSignUpView } from "../../views";
import type { AuthClient } from "../../client";
import type { AuthError } from "../../types";

export interface PasswordSignUpFormProps {
  authClient: AuthClient;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
}

export function PasswordSignUpForm({
  authClient,
  disabled = false,
  ...options
}: PasswordSignUpFormProps) {
  const {
    email,
    setEmail,
    password,
    setPassword,
    status,
    error,
    submit,
  } = usePasswordSignUp(authClient, options);

  return (
    <PasswordSignUpView
      email={email}
      password={password}
      status={disabled ? "loading" : status}
      error={error}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={submit}
    />
  );
}
