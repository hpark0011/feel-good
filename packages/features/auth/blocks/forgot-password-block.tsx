"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ForgotPasswordForm } from "../components/forms/forgot-password-form";
import type { AuthClient } from "../client";
import type { AuthMode, AuthError } from "../types";

export interface ForgotPasswordBlockProps {
  authClient?: AuthClient;
  mode?: AuthMode;
  signInHref?: string;
  resetPasswordHref?: string;
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
}

function ForgotPasswordBlockContent({
  authClient,
  mode = "default",
  signInHref = "/sign-in",
  resetPasswordHref = "/reset-password",
  onSuccess,
  onError,
}: ForgotPasswordBlockProps) {
  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      <ForgotPasswordForm
        authClient={authClient}
        mode={mode}
        redirectTo={resetPasswordHref}
        onSuccess={onSuccess}
        onError={onError}
      />

      {/* Back to Sign In Link */}
      <p className="text-muted-foreground text-center text-sm">
        Remember your password?{" "}
        <Link href={signInHref} className="hover:text-foreground underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}

export function ForgotPasswordBlock(props: ForgotPasswordBlockProps) {
  return (
    <Suspense
      fallback={
        <div className="bg-muted/50 mx-auto h-64 w-full max-w-md animate-pulse rounded-lg" />
      }
    >
      <ForgotPasswordBlockContent {...props} />
    </Suspense>
  );
}
