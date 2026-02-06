import { OTPSignUpBlock } from "@feel-good/features/auth/blocks";
import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
  return (
    <OTPSignUpBlock
      authClient={authClient}
      signInHref="/sign-in"
      redirectTo="/dashboard"
    />
  );
}
