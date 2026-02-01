import { ComponentsSection } from "@/app/components/_components/components-section";
import { ComponentsSectionHeader } from "@/app/components/_components/components-section-header";
import { Divider } from "@/components/divider";
import { Switch } from "@feel-good/ui/primitives/switch";

export function SwitchVariants() {
  return (
    <div className="flex flex-col w-full">
      <Divider />

      <ComponentsSection>
        <ComponentsSectionHeader>Variant: Default</ComponentsSectionHeader>
        <Switch variant="default" size="default" />
      </ComponentsSection>

      <Divider />

      <ComponentsSection>
        <ComponentsSectionHeader>Variant: Panel Toggle</ComponentsSectionHeader>
        <Switch variant="panel" size="panel" />
      </ComponentsSection>
    </div>
  );
}
