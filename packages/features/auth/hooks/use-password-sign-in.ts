"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { AuthClient } from "../client";
import { getAuthErrorMessage, type AuthStatus, type AuthError } from "../types";
import { getSafeRedirectUrl } from "../utils/validate-redirect";

export interface UsePasswordSignInOptions {
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
}

export interface UsePasswordSignInReturn {
  // Form state
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;

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

export function usePasswordSignIn(
  authClient: AuthClient,
  options: UsePasswordSignInOptions = {}
): UsePasswordSignInReturn {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [error, setError] = useState<AuthError | null>(null);

  // Race condition prevention: track if component is mounted
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const submit = useCallback(async () => {
    // Guard against double-submission
    if (status === "loading") return;

    setError(null);
    setStatus("loading");

    const callbackURL = options.redirectTo
      ? getSafeRedirectUrl(options.redirectTo, undefined)
      : undefined;

    await authClient.signIn.email(
      { email, password, callbackURL },
      {
        onSuccess: () => {
          setPassword(""); // Clear password immediately
          if (!isMountedRef.current) return;
          setStatus("success");
          options.onSuccess?.();
        },
        onError: (ctx) => {
          if (!isMountedRef.current) return;
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
  }, [email, password, authClient, options, status]);

  const reset = useCallback(() => {
    setEmail("");
    setPassword("");
    setStatus("idle");
    setError(null);
  }, []);

  return {
    email,
    setEmail,
    password,
    setPassword,
    status,
    error,
    isLoading: status === "loading",
    isSuccess: status === "success",
    isError: status === "error",
    submit,
    reset,
  };
}
