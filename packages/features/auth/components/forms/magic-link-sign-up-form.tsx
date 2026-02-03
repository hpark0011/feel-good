"use client";

import { useMagicLinkRequest } from "../../hooks";
import { MagicLinkSignUpView } from "../views";
import type { AuthClient } from "../../client";
import type { AuthMode, AuthError } from "../../types";

export interface MagicLinkSignUpFormProps {
  authClient?: AuthClient;
  mode?: AuthMode;
  redirectTo?: string;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
}

export function MagicLinkSignUpForm({
  authClient,
  mode = "default",
  disabled = false,
  ...options
}: MagicLinkSignUpFormProps) {
  // Preview mode — static rendering with no-op handlers
  if (mode === "preview") {
    return (
      <MagicLinkSignUpView
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
      "MagicLinkSignUpForm requires authClient in production mode"
    );
  }

  return (
    <MagicLinkSignUpFormInternal
      authClient={authClient}
      disabled={disabled}
      {...options}
    />
  );
}

// Internal component that uses hooks
function MagicLinkSignUpFormInternal({
  authClient,
  disabled,
  ...options
}: Omit<MagicLinkSignUpFormProps, "mode"> & { authClient: AuthClient }) {
  const { email, setEmail, status, error, submit, reset } = useMagicLinkRequest(
    authClient,
    options
  );

  return (
    <MagicLinkSignUpView
      email={email}
      status={disabled ? "loading" : status}
      error={error}
      onEmailChange={setEmail}
      onSubmit={submit}
      onReset={reset}
    />
  );
}
