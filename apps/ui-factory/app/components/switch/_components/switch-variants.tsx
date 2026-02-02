import { PageSection } from "@/components/page-section";
import { PageSectionHeader } from "@/components/page-section-header";
import { Divider } from "@/components/divider";
import { Switch } from "@feel-good/ui/primitives/switch";

export function SwitchVariants() {
  return (
    <div className="flex flex-col w-full">
      <Divider />

      <PageSection>
        <PageSectionHeader>Variant: Default</PageSectionHeader>
        <Switch variant="default" size="default" />
      </PageSection>

      <Divider />

      <PageSection>
        <PageSectionHeader>Variant: Theme</PageSectionHeader>
        <Switch variant="theme" size="default" />
      </PageSection>

      <Divider />

      <PageSection>
        <PageSectionHeader>Variant: Panel Toggle</PageSectionHeader>
        <Switch variant="panel" size="panel" />
      </PageSection>
    </div>
  );
}
