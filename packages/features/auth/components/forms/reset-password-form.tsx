"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useResetPassword } from "../../hooks";
import { ResetPasswordView } from "../views";
import type { AuthClient } from "../../client";
import type { AuthMode, AuthError } from "../../types";
import { getSafeRedirectUrl } from "../../utils/validate-redirect";

export interface ResetPasswordFormProps {
  authClient?: AuthClient;
  mode?: AuthMode;
  redirectTo?: string;
  signInHref?: string;
  forgotPasswordHref?: string;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
}

export function ResetPasswordForm({
  authClient,
  mode = "default",
  redirectTo = "/sign-in",
  signInHref = "/sign-in",
  forgotPasswordHref = "/forgot-password",
  disabled = false,
  ...options
}: ResetPasswordFormProps) {
  // Preview mode — static rendering with no-op handlers
  if (mode === "preview") {
    return (
      <ResetPasswordView
        password=""
        confirmPassword=""
        status="idle"
        error={null}
        hasToken={true}
        onPasswordChange={() => {}}
        onConfirmPasswordChange={() => {}}
        onSubmit={() => {}}
        signInHref={signInHref}
        forgotPasswordHref={forgotPasswordHref}
      />
    );
  }

  // Production mode — real auth
  if (!authClient) {
    throw new Error("ResetPasswordForm requires authClient in production mode");
  }

  return (
    <ResetPasswordFormInternal
      authClient={authClient}
      redirectTo={redirectTo}
      signInHref={signInHref}
      forgotPasswordHref={forgotPasswordHref}
      disabled={disabled}
      {...options}
    />
  );
}

// Internal component that uses hooks
function ResetPasswordFormInternal({
  authClient,
  redirectTo,
  signInHref,
  forgotPasswordHref,
  disabled,
  ...options
}: Omit<ResetPasswordFormProps, "mode"> & {
  authClient: AuthClient;
  redirectTo: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

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
      setTimeout(() => router.push(safeRedirect), 2000);
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
