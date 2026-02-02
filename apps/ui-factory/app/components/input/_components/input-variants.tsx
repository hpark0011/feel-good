import { ComponentsSection } from "@/app/components/_components/components-section";
import { ComponentsSectionHeader } from "@/app/components/_components/components-section-header";
import { Divider } from "@/components/divider";
import { Input } from "@feel-good/ui/primitives/input";

export function InputVariants() {
  return (
    <div className="flex flex-col w-full">
      <Divider />

      <ComponentsSection>
        <ComponentsSectionHeader>Variant: Input Basic</ComponentsSectionHeader>
        <Input placeholder="Enter your email" />
      </ComponentsSection>
    </div>
  );
}
