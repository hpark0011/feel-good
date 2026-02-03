"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { AuthClient } from "../client";
import {
  getAuthErrorMessage,
  validatePassword,
  type AuthStatus,
  type AuthError,
} from "../types";

export interface UsePasswordSignUpOptions {
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
}

export interface UsePasswordSignUpReturn {
  // Form state
  name: string;
  setName: (value: string) => void;
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

export function usePasswordSignUp(
  authClient: AuthClient,
  options: UsePasswordSignUpOptions = {}
): UsePasswordSignUpReturn {
  const [name, setName] = useState("");
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

    // Client-side validation
    const passwordError = validatePassword(password);
    if (passwordError) {
      const authError: AuthError = {
        code: passwordError,
        message: getAuthErrorMessage(passwordError),
      };
      setError(authError);
      options.onError?.(authError);
      return;
    }

    setStatus("loading");

    await authClient.signUp.email(
      { name, email, password },
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
  }, [name, email, password, authClient, options, status]);

  const reset = useCallback(() => {
    setName("");
    setEmail("");
    setPassword("");
    setStatus("idle");
    setError(null);
  }, []);

  return {
    name,
    setName,
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
