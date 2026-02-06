"use client";

import { useState, useCallback, useRef } from "react";
import type { AuthClient } from "../client";
import {
  getAuthErrorMessage,
  type AuthStatus,
  type AuthError,
  type OTPStep,
} from "../types";
import { getSafeRedirectUrl } from "../utils/validate-redirect";

export interface UseOTPAuthOptions {
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
}

export interface UseOTPAuthReturn {
  // Form state
  email: string;
  setEmail: (value: string) => void;
  otp: string;
  setOtp: (value: string) => void;
  step: OTPStep;

  // Status
  status: AuthStatus;
  error: AuthError | null;

  // Actions
  requestOTP: () => Promise<void>;
  verifyOTP: () => Promise<void>;
  goBack: () => void;
  reset: () => void;
}

export function useOTPAuth(
  authClient: AuthClient,
  options: UseOTPAuthOptions = {}
): UseOTPAuthReturn {
  const { redirectTo, onSuccess, onError } = options;
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<OTPStep>("email");
  const [status, setStatus] = useState<AuthStatus>("idle");
  const [error, setError] = useState<AuthError | null>(null);
  const statusRef = useRef(status);
  statusRef.current = status;

  const requestOTP = useCallback(async () => {
    if (statusRef.current === "loading") return;

    setError(null);
    setStatus("loading");

    await authClient.emailOtp.sendVerificationOtp(
      { email, type: "sign-in" },
      {
        onSuccess: () => {
          setStatus("idle");
          setStep("verify");
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
  }, [email, authClient, onError]);

  const verifyOTP = useCallback(async () => {
    if (statusRef.current === "loading") return;

    setError(null);
    setStatus("loading");

    const callbackURL = redirectTo
      ? getSafeRedirectUrl(redirectTo, undefined)
      : undefined;

    await authClient.signIn.emailOtp(
      { email, otp },
      {
        onSuccess: () => {
          setStatus("success");
          if (callbackURL) {
            window.location.href = callbackURL;
          }
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
  }, [email, otp, authClient, redirectTo, onSuccess, onError]);

  const goBack = useCallback(() => {
    setStep("email");
    setOtp("");
    setError(null);
    setStatus("idle");
  }, []);

  const reset = useCallback(() => {
    setEmail("");
    setOtp("");
    setStep("email");
    setStatus("idle");
    setError(null);
  }, []);

  return {
    email,
    setEmail,
    otp,
    setOtp,
    step,
    status,
    error,
    requestOTP,
    verifyOTP,
    goBack,
    reset,
  };
}
