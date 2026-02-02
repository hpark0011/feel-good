import { ComponentsSection } from "@/app/components/_components/components-section";
import { ComponentsSectionHeader } from "@/app/components/_components/components-section-header";
import { Divider } from "@/components/divider";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@feel-good/ui/primitives/field";
import { Input } from "@feel-good/ui/primitives/input";

export function InputVariants() {
  return (
    <div className="flex flex-col w-full">
      <Divider />

      <ComponentsSection>
        <ComponentsSectionHeader>Variant: Basic</ComponentsSectionHeader>
        <Input placeholder="Enter your email" />
      </ComponentsSection>

      <Divider />

      <ComponentsSection>
        <ComponentsSectionHeader>
          Variant: Invalid
        </ComponentsSectionHeader>
        <Input placeholder="Enter your email" aria-invalid />
      </ComponentsSection>

      <Divider />

      <ComponentsSection>
        <ComponentsSectionHeader>
          Variant: With Label
        </ComponentsSectionHeader>
        <Field>
          <FieldLabel htmlFor="fieldgroup-name">Name</FieldLabel>
          <Input id="fieldgroup-name" placeholder="Jordan Lee" />
        </Field>
      </ComponentsSection>

      <Divider />

      <ComponentsSection>
        <ComponentsSectionHeader>
          Variant: With Description
        </ComponentsSectionHeader>
        <Field>
          <FieldLabel htmlFor="input-field-username">Username</FieldLabel>
          <Input
            id="input-field-username"
            type="text"
            placeholder="Enter your username"
          />
          <FieldDescription>
            Choose a unique username for your account.
          </FieldDescription>
        </Field>
      </ComponentsSection>
    </div>
  );
}
