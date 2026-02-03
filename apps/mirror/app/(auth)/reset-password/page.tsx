import { ResetPasswordBlock } from "@feel-good/features/auth/blocks";
import { authClient } from "@/lib/auth-client";

export default function ResetPasswordPage() {
  return (
    <ResetPasswordBlock
      authClient={authClient}
      signInHref="/sign-in"
      forgotPasswordHref="/forgot-password"
      redirectTo="/sign-in"
    />
  );
}
