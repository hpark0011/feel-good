"use client";

import { useOTPAuth } from "../../hooks/use-otp-auth";
import { OTPLoginView } from "../../views";
import type { AuthClient } from "../../client";
import type { AuthError } from "../../types";

export interface OTPLoginFormProps {
  authClient: AuthClient;
  redirectTo?: string;
  disabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: AuthError) => void;
}

export function OTPLoginForm({
  authClient,
  disabled = false,
  ...options
}: OTPLoginFormProps) {
  const {
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
  } = useOTPAuth(authClient, options);

  return (
    <OTPLoginView
      email={email}
      otp={otp}
      step={step}
      status={disabled ? "loading" : status}
      error={error}
      onEmailChange={setEmail}
      onOtpChange={setOtp}
      onRequestOTP={requestOTP}
      onVerifyOTP={verifyOTP}
      onBack={goBack}
    />
  );
}
