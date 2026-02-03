"use client";

import { Suspense } from "react";
import Link from "next/link";
import {
  PasswordLoginForm,
  type PasswordLoginFormProps,
} from "../components/forms/password-login-form";
import {
  MagicLinkLoginForm,
  type MagicLinkLoginFormProps,
} from "../components/forms/magic-link-login-form";
import {
  OAuthButtons,
  type OAuthButtonsProps,
} from "../components/shared/oauth-buttons";
import { AuthDivider } from "./shared/auth-divider";
import type { AuthClient } from "../client";
import type { AuthError } from "../types";
import type { FC } from "react";

export interface LoginBlockSlots {
  passwordForm?: FC<PasswordLoginFormProps>;
  magicLinkForm?: FC<MagicLinkLoginFormProps>;
  oauthButtons?: FC<OAuthButtonsProps>;
}

export interface LoginBlockProps {
  authClient: AuthClient;
  signUpHref?: string;
  forgotPasswordHref?: string;
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
  slots?: LoginBlockSlots;
}

function LoginBlockContent({
  authClient,
  signUpHref = "/sign-up",
  forgotPasswordHref = "/forgot-password",
  redirectTo,
  onSuccess,
  onError,
  slots,
}: LoginBlockProps) {
  const PasswordForm = slots?.passwordForm ?? PasswordLoginForm;
  const MagicLinkForm = slots?.magicLinkForm ?? MagicLinkLoginForm;
  const OAuth = slots?.oauthButtons ?? OAuthButtons;

  const formProps = {
    authClient,
    redirectTo,
    onSuccess,
    onError,
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      {/* OAuth Section */}
      <OAuth
        authClient={authClient}
        redirectTo={redirectTo}
        label="Continue with Google"
        onError={onError}
      />

      <AuthDivider>or continue with</AuthDivider>

      {/* Password Login */}
      <PasswordForm
        {...formProps}
        forgotPasswordHref={forgotPasswordHref}
      />

      <AuthDivider>or</AuthDivider>

      {/* Magic Link Login */}
      <MagicLinkForm {...formProps} />

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
        <div className="bg-muted/50 mx-auto h-96 w-full max-w-md animate-pulse rounded-lg" />
      }
    >
      <LoginBlockContent {...props} />
    </Suspense>
  );
}
