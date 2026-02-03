import {
  PasswordSignUpForm,
  MagicLinkSignUpForm,
} from "@feel-good/features/auth/components/forms";
import { Divider } from "@/components/divider";
import { PageSection } from "@/components/page-section";
import { PageSectionHeader } from "@/components/page-section-header";

export function SignUpView() {
  return (
    <div className="flex flex-col w-full">
      <Divider />
      <PageSection>
        <PageSectionHeader>Password</PageSectionHeader>
        <PasswordSignUpForm mode="preview" />
      </PageSection>

      <Divider />
      <PageSection>
        <PageSectionHeader>Magic Link</PageSectionHeader>
        <MagicLinkSignUpForm mode="preview" />
      </PageSection>
    </div>
  );
}
