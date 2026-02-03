"use client";

import { useMagicLinkRequest } from "../../hooks";
import { MagicLinkLoginView } from "../views";
import type { AuthClient } from "../../client";
import type { AuthMode, AuthError } from "../../types";

export interface MagicLinkLoginFormProps {
  authClient?: AuthClient;
  mode?: AuthMode;
  redirectTo?: string;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
}

export function MagicLinkLoginForm({
  authClient,
  mode = "default",
  disabled = false,
  ...options
}: MagicLinkLoginFormProps) {
  // Preview mode — static rendering with no-op handlers
  if (mode === "preview") {
    return (
      <MagicLinkLoginView
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
      "MagicLinkLoginForm requires authClient in production mode"
    );
  }

  return (
    <MagicLinkLoginFormInternal
      authClient={authClient}
      disabled={disabled}
      {...options}
    />
  );
}

// Internal component that uses hooks
function MagicLinkLoginFormInternal({
  authClient,
  disabled,
  ...options
}: Omit<MagicLinkLoginFormProps, "mode"> & { authClient: AuthClient }) {
  const { email, setEmail, status, error, submit, reset } = useMagicLinkRequest(
    authClient,
    options
  );

  return (
    <MagicLinkLoginView
      email={email}
      status={disabled ? "loading" : status}
      error={error}
      onEmailChange={setEmail}
      onSubmit={submit}
      onReset={reset}
    />
  );
}
