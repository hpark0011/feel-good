import { ForgotPasswordBlock } from "@feel-good/features/auth/blocks";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  return (
    <ForgotPasswordBlock
      authClient={authClient}
      signInHref="/sign-in"
      resetPasswordHref="/reset-password"
    />
  );
}
