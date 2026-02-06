import { OTPLoginBlock } from "@feel-good/features/auth/blocks";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  return (
    <OTPLoginBlock
      authClient={authClient}
      signUpHref="/sign-up"
      redirectTo="/dashboard"
    />
  );
}
