import { Button } from "@feel-good/ui/primitives/button";
import Link from "next/link";

export function MirrorHomePage() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-screen gap-10">
      <div className="text-2xl font-semibold">
        MIRROR
      </div>

      <div className="flex flex-col gap-1.5">
        <Button variant="outline" size="lg" asChild>
          <Link href="/sign-in">
            Sign in
          </Link>
        </Button>
        <Button variant="primary" size="lg" asChild>
          <Link href="/sign-up">
            Create account
          </Link>
        </Button>
      </div>
    </div>
  );
}
