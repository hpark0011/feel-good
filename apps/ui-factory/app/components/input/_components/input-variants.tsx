import { ComponentsSection } from "@/app/components/_components/components-section";
import { ComponentsSectionHeader } from "@/app/components/_components/components-section-header";
import { Divider } from "@/components/divider";
import { Field, FieldLabel } from "@feel-good/ui/primitives/field";
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
    </div>
  );
}
