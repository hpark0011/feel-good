"use client";

import { MagicLinkSignUpView } from "@feel-good/features/auth/views";
import { Divider } from "@/components/divider";
import { PageSection } from "@/components/page-section";
import { PageSectionHeader } from "@/components/page-section-header";

const noop = () => {};

export function SignUpView() {
  return (
    <div className="flex flex-col w-full">
      <Divider />
      <PageSection>
        <PageSectionHeader>Magic Link</PageSectionHeader>
        <div className="max-w-sm w-full">
          <MagicLinkSignUpView
            email=""
            status="idle"
            error={null}
            onEmailChange={noop}
            onSubmit={noop}
          />
        </div>
      </PageSection>
    </div>
  );
}
