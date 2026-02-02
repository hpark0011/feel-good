import { ComponentsSection } from "@/app/components/_components/components-section";
import { ComponentsSectionHeader } from "@/app/components/_components/components-section-header";
import { Divider } from "@/components/divider";
import { Button } from "@feel-good/ui/primitives/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@feel-good/ui/primitives/field";
import { Input } from "@feel-good/ui/primitives/input";

export function InputVariants() {
  return (
    <div className="flex flex-col w-full">
      <Divider />

      <ComponentsSection>
        <ComponentsSectionHeader>Variant: Default</ComponentsSectionHeader>
        <Input placeholder="Enter your email" />
      </ComponentsSection>

      <Divider />

      <ComponentsSection>
        <ComponentsSectionHeader>Variant: Underline</ComponentsSectionHeader>
        <Input placeholder="Enter your email" variant="underline" />
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

      <Divider />

      <ComponentsSection>
        <ComponentsSectionHeader>
          Variant: Form
        </ComponentsSectionHeader>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="fieldgroup-form-name">
              Name
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="fieldgroup-form-name"
              placeholder="Jordan Lee"
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="fieldgroup-form-email">
              Email
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="fieldgroup-form-email"
              type="email"
              placeholder="name@example.com"
              required
            />
            <FieldDescription>
              We&apos;ll send updates to this address.
            </FieldDescription>
          </Field>

          <Field orientation="horizontal">
            <Button type="reset" variant="outline">
              Reset
            </Button>
            <Button type="submit" variant="primary">Submit</Button>
          </Field>
        </FieldGroup>
      </ComponentsSection>
    </div>
  );
}
