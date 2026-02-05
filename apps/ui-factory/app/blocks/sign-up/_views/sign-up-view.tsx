"use client";

import {
  PasswordSignUpView,
  MagicLinkSignUpView,
} from "@feel-good/features/auth/views";
import { Divider } from "@/components/divider";
import { PageSection } from "@/components/page-section";
import { PageSectionHeader } from "@/components/page-section-header";

const noop = () => {};

export function SignUpView() {
  return (
    <div className="flex flex-col w-full">
      <Divider />
      <PageSection>
        <PageSectionHeader>Password</PageSectionHeader>
        <PasswordSignUpView
          email=""
          password=""
          status="idle"
          error={null}
          onEmailChange={noop}
          onPasswordChange={noop}
          onSubmit={noop}
        />
      </PageSection>

      <Divider />
      <PageSection>
        <PageSectionHeader>Magic Link</PageSectionHeader>
        <MagicLinkSignUpView
          email=""
          status="idle"
          error={null}
          onEmailChange={noop}
          onSubmit={noop}
        />
      </PageSection>
    </div>
  );
}
