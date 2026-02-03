"use client";

import {
  PasswordLoginView,
  MagicLinkLoginView,
} from "@feel-good/features/auth/components/views";
import { Divider } from "@/components/divider";
import { PageSection } from "@/components/page-section";
import { PageSectionHeader } from "@/components/page-section-header";

const noop = () => {};

export function LoginView() {
  return (
    <div className="flex flex-col w-full">
      <Divider />
      <PageSection>
        <PageSectionHeader>Password</PageSectionHeader>
        <PasswordLoginView
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
        <MagicLinkLoginView
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
