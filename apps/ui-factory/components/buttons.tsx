import { Button } from "@feel-good/ui/primitives/button";
import { SectionHeader } from "@/app/_components/section-header";
import { ButtonGroup } from "@/app/_components/button-group";
import { Section } from "@/app/_components/section";
import { BUTTON_VARIANTS } from "./button-variants.config";

const variantLabels: Record<(typeof BUTTON_VARIANTS)[number], string> = {
  default: "Default",
  secondary: "Secondary",
  outline: "Outline",
  ghost: "Ghost",
  link: "Link",
  destructive: "Destructive",
};

export function Buttons() {
  return (
    <div className="flex flex-col gap-8">
      <Section>
        <SectionHeader>Size: xs</SectionHeader>
        <ButtonGroup>
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} size="xs">
              {variantLabels[variant]}
            </Button>
          ))}
        </ButtonGroup>
      </Section>

      <Section>
        <SectionHeader>Size: sm</SectionHeader>
        <ButtonGroup>
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} size="sm">
              {variantLabels[variant]}
            </Button>
          ))}
        </ButtonGroup>
      </Section>

      <Section>
        <SectionHeader>Size: default</SectionHeader>
        <ButtonGroup>
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant}>
              {variantLabels[variant]}
            </Button>
          ))}
        </ButtonGroup>
      </Section>

      <Section>
        <SectionHeader>Size: lg</SectionHeader>
        <ButtonGroup>
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} size="lg">
              {variantLabels[variant]}
            </Button>
          ))}
        </ButtonGroup>
      </Section>

      <Section>
        <SectionHeader>Size: icon</SectionHeader>
        <ButtonGroup>
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} size="icon">
              Icon
            </Button>
          ))}
        </ButtonGroup>
      </Section>
    </div>
  );
}
