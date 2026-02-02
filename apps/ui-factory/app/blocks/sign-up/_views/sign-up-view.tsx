import { LoginForm } from "@/app/blocks/login/_components/login-form";
import { Divider } from "@/components/divider";
import { PageSection } from "@/components/page-section";
import { PageSectionHeader } from "@/components/page-section-header";

export function SignUpView() {
  return (
    <div className="flex flex-col w-full">
      <Divider />
      <PageSection>
        <PageSectionHeader>Sign Up Form</PageSectionHeader>
        <LoginForm />
      </PageSection>
    </div>
  );
}
