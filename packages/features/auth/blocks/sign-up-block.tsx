"use client";

import Link from "next/link";
import type { AuthClient } from "../client";
import { MagicLinkSignUpForm } from "../components/forms/magic-link-sign-up-form";
import { OAuthButtons } from "../components/shared/oauth-buttons";
import type { AuthError } from "../types";
import { AuthDivider } from "./shared/auth-divider";

export interface SignUpBlockProps {
  authClient: AuthClient;
  signInHref?: string;
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
}

export function SignUpBlock({
  authClient,
  signInHref = "/sign-in",
  redirectTo,
  onSuccess,
  onError,
}: SignUpBlockProps) {
  return (
    <div className="mx-auto w-full max-w-sm px-8 relative space-y-6 pb-10">
      {/* Magic Link Sign Up */}
      <MagicLinkSignUpForm
        authClient={authClient}
        redirectTo={redirectTo}
        onSuccess={onSuccess}
        onError={onError}
      />

      <AuthDivider>or</AuthDivider>

      {/* OAuth Section */}
      <OAuthButtons
        authClient={authClient}
        redirectTo={redirectTo}
        label="Continue with Google"
        onError={onError}
      />

      {/* Sign In Link */}
      <p className="text-muted-foreground text-center text-sm">
        Already have an account?{" "}
        <Link href={signInHref} className="hover:text-foreground underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
