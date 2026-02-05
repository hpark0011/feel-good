"use client";

import Link from "next/link";
import type { FC } from "react";
import { Suspense } from "react";
import type { AuthClient } from "../client";
import {
  MagicLinkLoginForm,
  type MagicLinkLoginFormProps,
} from "../components/forms/magic-link-login-form";
import {
  OAuthButtons,
  type OAuthButtonsProps,
} from "../components/shared/oauth-buttons";
import type { AuthError } from "../types";
import { AuthDivider } from "./shared/auth-divider";

export interface LoginBlockSlots {
  magicLinkForm?: FC<MagicLinkLoginFormProps>;
  oauthButtons?: FC<OAuthButtonsProps>;
}

export interface LoginBlockProps {
  authClient: AuthClient;
  signUpHref?: string;
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
  slots?: LoginBlockSlots;
}

function LoginBlockContent({
  authClient,
  signUpHref = "/sign-up",
  redirectTo,
  onSuccess,
  onError,
  slots,
}: LoginBlockProps) {
  const MagicLinkForm = slots?.magicLinkForm ?? MagicLinkLoginForm;
  const OAuth = slots?.oauthButtons ?? OAuthButtons;

  const formProps = {
    authClient,
    redirectTo,
    onSuccess,
    onError,
  };

  return (
    <div className="mx-auto w-full max-w-sm px-8 relative space-y-6 pb-10">
      {/* Magic Link Login */}
      <MagicLinkForm {...formProps} />

      <AuthDivider>or</AuthDivider>

      {/* OAuth Section */}
      <OAuth
        authClient={authClient}
        redirectTo={redirectTo}
        label="Continue with Google"
        onError={onError}
      />

      {/* Sign Up Link */}
      <p className="text-muted-foreground text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link href={signUpHref} className="hover:text-foreground underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}

export function LoginBlock(props: LoginBlockProps) {
  return (
    <Suspense
      fallback={
        <div className="bg-muted/50 mx-auto h-96 w-full max-w-sm animate-pulse rounded-lg" />
      }
    >
      <LoginBlockContent {...props} />
    </Suspense>
  );
}
