"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ResetPasswordForm } from "../components/forms/reset-password-form";
import type { AuthClient } from "../client";
import type { AuthMode, AuthError } from "../types";

export interface ResetPasswordBlockProps {
  authClient?: AuthClient;
  mode?: AuthMode;
  signInHref?: string;
  forgotPasswordHref?: string;
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
}

function ResetPasswordBlockContent({
  authClient,
  mode = "default",
  signInHref = "/sign-in",
  forgotPasswordHref = "/forgot-password",
  redirectTo = "/sign-in",
  onSuccess,
  onError,
}: ResetPasswordBlockProps) {
  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <ResetPasswordForm
        authClient={authClient}
        mode={mode}
        signInHref={signInHref}
        forgotPasswordHref={forgotPasswordHref}
        redirectTo={redirectTo}
        onSuccess={onSuccess}
        onError={onError}
      />

      {/* Back to Sign In Link */}
      <p className="text-muted-foreground text-center text-sm">
        <Link href={signInHref} className="hover:text-foreground underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export function ResetPasswordBlock(props: ResetPasswordBlockProps) {
  return (
    <Suspense
      fallback={
        <div className="bg-muted/50 mx-auto h-64 w-full max-w-md animate-pulse rounded-lg" />
      }
    >
      <ResetPasswordBlockContent {...props} />
    </Suspense>
  );
}
