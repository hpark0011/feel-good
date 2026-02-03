"use client";

import { usePasswordSignUp } from "../../hooks";
import { PasswordSignUpView } from "../views";
import type { AuthClient } from "../../client";
import type { AuthMode, AuthError } from "../../types";

export interface PasswordSignUpFormProps {
  authClient?: AuthClient;
  mode?: AuthMode;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
}

export function PasswordSignUpForm({
  authClient,
  mode = "default",
  disabled = false,
  ...options
}: PasswordSignUpFormProps) {
  // Preview mode — static rendering with no-op handlers
  if (mode === "preview") {
    return (
      <PasswordSignUpView
        name=""
        email=""
        password=""
        status="idle"
        error={null}
        onNameChange={() => {}}
        onEmailChange={() => {}}
        onPasswordChange={() => {}}
        onSubmit={() => {}}
      />
    );
  }

  // Production mode — real auth
  if (!authClient) {
    throw new Error(
      "PasswordSignUpForm requires authClient in production mode"
    );
  }

  return (
    <PasswordSignUpFormInternal
      authClient={authClient}
      disabled={disabled}
      {...options}
    />
  );
}

// Internal component that uses hooks
function PasswordSignUpFormInternal({
  authClient,
  disabled,
  ...options
}: Omit<PasswordSignUpFormProps, "mode"> & { authClient: AuthClient }) {
  const {
    name,
    setName,
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
      name={name}
      email={email}
      password={password}
      status={disabled ? "loading" : status}
      error={error}
      onNameChange={setName}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onSubmit={submit}
    />
  );
}
