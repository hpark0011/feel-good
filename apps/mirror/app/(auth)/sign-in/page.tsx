import { LoginBlock } from "@feel-good/features/auth/blocks";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  return (
    <LoginBlock
      authClient={authClient}
      signUpHref="/sign-up"
      forgotPasswordHref="/forgot-password"
      redirectTo="/dashboard"
    />
  );
}
