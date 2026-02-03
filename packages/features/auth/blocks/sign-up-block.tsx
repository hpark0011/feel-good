"use client";

import { Suspense } from "react";
import Link from "next/link";
import {
  PasswordSignUpForm,
  type PasswordSignUpFormProps,
} from "../components/forms/password-sign-up-form";
import {
  MagicLinkSignUpForm,
  type MagicLinkSignUpFormProps,
} from "../components/forms/magic-link-sign-up-form";
import {
  OAuthButtons,
  type OAuthButtonsProps,
} from "../components/shared/oauth-buttons";
import { AuthDivider } from "./shared/auth-divider";
import type { AuthClient } from "../client";
import type { AuthMode, AuthError } from "../types";
import type { FC } from "react";

export interface SignUpBlockSlots {
  passwordForm?: FC<PasswordSignUpFormProps>;
  magicLinkForm?: FC<MagicLinkSignUpFormProps>;
  oauthButtons?: FC<OAuthButtonsProps>;
}

export interface SignUpBlockProps {
  authClient?: AuthClient;
  mode?: AuthMode;
  signInHref?: string;
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
  slots?: SignUpBlockSlots;
}

function SignUpBlockContent({
  authClient,
  mode = "default",
  signInHref = "/sign-in",
  redirectTo,
  onSuccess,
  onError,
  slots,
}: SignUpBlockProps) {
  const PasswordForm = slots?.passwordForm ?? PasswordSignUpForm;
  const MagicLinkForm = slots?.magicLinkForm ?? MagicLinkSignUpForm;
  const OAuth = slots?.oauthButtons ?? OAuthButtons;

  const formProps = {
    authClient,
    mode,
    redirectTo,
    onSuccess,
    onError,
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6">
      {/* OAuth Section */}
      <OAuth
        authClient={authClient}
        mode={mode}
        redirectTo={redirectTo}
        label="Sign up with Google"
        onError={onError}
      />

      <AuthDivider>or continue with</AuthDivider>

      {/* Password Sign Up */}
      <PasswordForm {...formProps} />

      <AuthDivider>or</AuthDivider>

      {/* Magic Link Sign Up */}
      <MagicLinkForm {...formProps} />

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

export function SignUpBlock(props: SignUpBlockProps) {
  return (
    <Suspense
      fallback={
        <div className="bg-muted/50 mx-auto h-96 w-full max-w-md animate-pulse rounded-lg" />
      }
    >
      <SignUpBlockContent {...props} />
    </Suspense>
  );
}
