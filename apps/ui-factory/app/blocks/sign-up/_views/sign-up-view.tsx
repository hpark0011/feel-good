import { SignupForm } from "@/app/blocks/sign-up/_components/sign-up-form";
import { Divider } from "@/components/divider";
import { PageSection } from "@/components/page-section";
import { PageSectionHeader } from "@/components/page-section-header";

export function SignUpView() {
  return (
    <div className="flex flex-col w-full">
      <Divider />
      <PageSection>
        <PageSectionHeader>Sign Up Form</PageSectionHeader>
        <div className="flex flex-col w-full items-center">
          <SignupForm />
        </div>
      </PageSection>
    </div>
  );
}
