"use client";

import { useState, useCallback, useRef } from "react";
import type { AuthClient } from "../client";
import { getAuthErrorMessage, type AuthStatus, type AuthError } from "../types";
import { getSafeRedirectUrl } from "../utils/validate-redirect";

export interface UseForgotPasswordOptions {
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
}

export interface UseForgotPasswordReturn {
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

export function useForgotPassword(
  authClient: AuthClient,
  options: UseForgotPasswordOptions = {}
): UseForgotPasswordReturn {
  const { redirectTo: redirectToOption, onSuccess, onError } = options;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [error, setError] = useState<AuthError | null>(null);
  const statusRef = useRef(status);
  statusRef.current = status;

  const submit = useCallback(async () => {
    if (statusRef.current === "loading") return;

    setError(null);
    setStatus("loading");

    const redirectTo = getSafeRedirectUrl(redirectToOption, "/reset-password");

    await authClient.requestPasswordReset(
      { email, redirectTo },
      {
        onSuccess: () => {
          setStatus("success");
          onSuccess?.();
        },
        onError: (ctx) => {
          const authError: AuthError = {
            code: ctx.error.code ?? "UNKNOWN",
            message: getAuthErrorMessage(ctx.error.code ?? "UNKNOWN"),
          };
          setStatus("error");
          setError(authError);
          onError?.(authError);
        },
      }
    );
  }, [email, authClient, redirectToOption, onSuccess, onError]);

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
