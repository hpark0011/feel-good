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
import type { AuthError } from "../types";
import type { FC } from "react";

export interface SignUpBlockSlots {
  passwordForm?: FC<PasswordSignUpFormProps>;
  magicLinkForm?: FC<MagicLinkSignUpFormProps>;
  oauthButtons?: FC<OAuthButtonsProps>;
}

export interface SignUpBlockProps {
  authClient: AuthClient;
  signInHref?: string;
  redirectTo?: string;
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
  slots?: SignUpBlockSlots;
}

function SignUpBlockContent({
  authClient,
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
    redirectTo,
    onSuccess,
    onError,
  };

  return (
    <div className="mx-auto w-full max-w-sm px-8 relative space-y-6 pb-10">
      {/* Magic Link Sign Up */}
      <MagicLinkForm {...formProps} />

      <AuthDivider>or</AuthDivider>

      {/* OAuth Section */}
      <OAuth
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

export function SignUpBlock(props: SignUpBlockProps) {
  return (
    <Suspense
      fallback={
        <div className="bg-muted/50 mx-auto h-96 w-full max-w-sm animate-pulse rounded-lg" />
      }
    >
      <SignUpBlockContent {...props} />
    </Suspense>
  );
}
