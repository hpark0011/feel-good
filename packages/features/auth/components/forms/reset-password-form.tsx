"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useResetPassword } from "../../hooks";
import { ResetPasswordView } from "../../views";
import type { AuthClient } from "../../client";
import type { AuthError } from "../../types";
import { getSafeRedirectUrl } from "../../utils/validate-redirect";

export interface ResetPasswordFormProps {
  authClient: AuthClient;
  redirectTo?: string;
  signInHref?: string;
  forgotPasswordHref?: string;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
}

export function ResetPasswordForm({
  authClient,
  redirectTo = "/sign-in",
  signInHref = "/sign-in",
  forgotPasswordHref = "/forgot-password",
  disabled = false,
  ...options
}: ResetPasswordFormProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    status,
    error,
    hasToken,
    submit,
  } = useResetPassword(authClient, {
    token,
    redirectTo,
    onSuccess: () => {
      options.onSuccess?.();
      // Redirect to sign-in after success
      const safeRedirect = getSafeRedirectUrl(redirectTo, "/sign-in");
      timeoutRef.current = setTimeout(
        () => router.push(safeRedirect),
        2000
      );
    },
    onError: options.onError,
  });

  return (
    <ResetPasswordView
      password={password}
      confirmPassword={confirmPassword}
      status={disabled ? "loading" : status}
      error={error}
      hasToken={hasToken}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
      onSubmit={submit}
      signInHref={signInHref}
      forgotPasswordHref={forgotPasswordHref}
    />
  );
}
