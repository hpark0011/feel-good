"use client";

import { useState, useCallback } from "react";
import type { AuthClient } from "../client";
import { getAuthErrorMessage, type AuthStatus, type AuthError } from "../types";
import { getSafeRedirectUrl } from "../utils/validate-redirect";

export interface UseMagicLinkRequestOptions {
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
}

export interface UseMagicLinkRequestReturn {
  // Form state
  email: string;
  setEmail: (value: string) => void;

  // Status
  status: AuthStatus;
  error: AuthError | null;

  // Derived state for convenience
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;

  // Actions
  submit: () => Promise<void>;
  reset: () => void;
}

export function useMagicLinkRequest(
  authClient: AuthClient,
  options: UseMagicLinkRequestOptions = {}
): UseMagicLinkRequestReturn {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [error, setError] = useState<AuthError | null>(null);

  const submit = useCallback(async () => {
    // Guard against double-submission
    if (status === "loading") return;

    setError(null);
    setStatus("loading");

    const callbackURL = options.redirectTo
      ? getSafeRedirectUrl(options.redirectTo, undefined)
      : undefined;

    await authClient.signIn.magicLink(
      { email, callbackURL },
      {
        onSuccess: () => {
          setStatus("success");
          options.onSuccess?.();
        },
        onError: (ctx) => {
          const authError: AuthError = {
            code: ctx.error.code ?? "UNKNOWN",
            message: getAuthErrorMessage(ctx.error.code ?? "UNKNOWN"),
          };
          setStatus("error");
          setError(authError);
          options.onError?.(authError);
        },
      }
    );
  }, [email, authClient, options, status]);

  const reset = useCallback(() => {
    setEmail("");
    setStatus("idle");
    setError(null);
  }, []);

  return {
    email,
    setEmail,
    status,
    error,
    isLoading: status === "loading",
    isSuccess: status === "success",
    isError: status === "error",
    submit,
    reset,
  };
}
