import { SignUpBlock } from "@feel-good/features/auth/blocks";
import { authClient } from "@/lib/auth-client";

export default function SignUpPage() {
  return (
    <SignUpBlock
      authClient={authClient}
      signInHref="/sign-in"
      redirectTo="/dashboard"
    />
  );
}
