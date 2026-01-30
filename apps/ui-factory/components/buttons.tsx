import { Button } from "@feel-good/ui/primitives/button";
import { SectionHeader } from "@/app/_components/section-header";
import { ButtonGroup } from "@/app/_components/button-group";
import { Section } from "@/app/_components/section";

export function Buttons() {
  return (
    <div className="flex flex-col gap-8">
      <Section>
        <SectionHeader>Size: xs</SectionHeader>
        <ButtonGroup>
          <Button variant="default" size="xs">Default</Button>
          <Button variant="secondary" size="xs">Secondary</Button>
          <Button variant="outline" size="xs">Outline</Button>
          <Button variant="ghost" size="xs">Ghost</Button>
          <Button variant="link" size="xs">Link</Button>
          <Button variant="destructive" size="xs">Destructive</Button>
        </ButtonGroup>
      </Section>

      <Section>
        <SectionHeader>Size: sm</SectionHeader>
        <ButtonGroup>
          <Button variant="default" size="sm">Default</Button>
          <Button variant="secondary" size="sm">Secondary</Button>
          <Button variant="outline" size="sm">Outline</Button>
          <Button variant="ghost" size="sm">Ghost</Button>
          <Button variant="link" size="sm">Link</Button>
          <Button variant="destructive" size="sm">Destructive</Button>
        </ButtonGroup>
      </Section>

      <Section>
        <SectionHeader>Size: default</SectionHeader>
        <ButtonGroup>
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="destructive">Destructive</Button>
        </ButtonGroup>
      </Section>

      <Section>
        <SectionHeader>Size: lg</SectionHeader>
        <ButtonGroup>
          <Button variant="default" size="lg">Default</Button>
          <Button variant="secondary" size="lg">Secondary</Button>
          <Button variant="outline" size="lg">Outline</Button>
          <Button variant="ghost" size="lg">Ghost</Button>
          <Button variant="link" size="lg">Link</Button>
          <Button variant="destructive" size="lg">Destructive</Button>
        </ButtonGroup>
      </Section>

      <Section>
        <SectionHeader>Size: icon</SectionHeader>
        <ButtonGroup>
          <Button variant="default" size="icon">Icon</Button>
          <Button variant="secondary" size="icon">Icon</Button>
          <Button variant="outline" size="icon">Icon</Button>
          <Button variant="ghost" size="icon">Icon</Button>
          <Button variant="link" size="icon">Icon</Button>
          <Button variant="destructive" size="icon">Icon</Button>
        </ButtonGroup>
      </Section>
    </div>
  );
}
