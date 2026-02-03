import {
  PasswordLoginForm,
  MagicLinkLoginForm,
} from "@feel-good/features/auth/components/forms";
import { Divider } from "@/components/divider";
import { PageSection } from "@/components/page-section";
import { PageSectionHeader } from "@/components/page-section-header";

export function LoginView() {
  return (
    <div className="flex flex-col w-full">
      <Divider />
      <PageSection>
        <PageSectionHeader>Password</PageSectionHeader>
        <PasswordLoginForm mode="preview" />
      </PageSection>

      <Divider />
      <PageSection>
        <PageSectionHeader>Magic Link</PageSectionHeader>
        <MagicLinkLoginForm mode="preview" />
      </PageSection>
    </div>
  );
}
