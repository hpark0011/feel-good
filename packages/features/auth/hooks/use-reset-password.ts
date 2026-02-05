"use client";

import { useState, useCallback, useRef } from "react";
import type { AuthClient } from "../client";
import {
  getAuthErrorMessage,
  validatePassword,
  type AuthStatus,
  type AuthError,
} from "../types";

export interface UseResetPasswordOptions {
  token: string | null;
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
}

export interface UseResetPasswordReturn {
  // Form state
  password: string;
  setPassword: (value: string) => void;
  confirmPassword: string;
  setConfirmPassword: (value: string) => void;

  // Status
  status: AuthStatus;
  error: AuthError | null;

  // Token validity
  hasToken: boolean;

  // Derived state for convenience
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;

  // Actions
  submit: () => Promise<void>;
  reset: () => void;
}

export function useResetPassword(
  authClient: AuthClient,
  options: UseResetPasswordOptions
): UseResetPasswordReturn {
  const { token, onSuccess, onError } = options;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [error, setError] = useState<AuthError | null>(null);
  const statusRef = useRef(status);
  statusRef.current = status;

  const submit = useCallback(async () => {
    if (statusRef.current === "loading") return;

    setError(null);

    // Validate token exists
    if (!token) {
      const authError: AuthError = {
        code: "INVALID_TOKEN",
        message: getAuthErrorMessage("INVALID_TOKEN"),
      };
      setError(authError);
      onError?.(authError);
      return;
    }

    // Client-side validation
    const passwordError = validatePassword(password);
    if (passwordError) {
      const authError: AuthError = {
        code: passwordError,
        message: getAuthErrorMessage(passwordError),
      };
      setError(authError);
      onError?.(authError);
      return;
    }

    if (password !== confirmPassword) {
      const authError: AuthError = {
        code: "PASSWORDS_DONT_MATCH",
        message: getAuthErrorMessage("PASSWORDS_DONT_MATCH"),
      };
      setError(authError);
      onError?.(authError);
      return;
    }

    setStatus("loading");

    await authClient.resetPassword(
      { newPassword: password, token },
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
  }, [password, confirmPassword, authClient, token, onSuccess, onError]);

  const reset = useCallback(() => {
    setPassword("");
    setConfirmPassword("");
    setStatus("idle");
    setError(null);
  }, []);

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    status,
    error,
    hasToken: Boolean(token),
    isLoading: status === "loading",
    isSuccess: status === "success",
    isError: status === "error",
    submit,
    reset,
  };
}
