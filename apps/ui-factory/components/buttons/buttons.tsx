import { ButtonGroup } from "@/app/_components/button-group";
import { Section } from "@/app/_components/section";
import { SectionHeader } from "@/app/_components/section-header";
import { Button } from "@feel-good/ui/primitives/button";
import { PlusIcon } from "lucide-react";
import { BUTTON_VARIANTS } from "./button-variants.config";

const variantLabels: Record<(typeof BUTTON_VARIANTS)[number], string> = {
  default: "Default",
  primary: "Primary",
  secondary: "Secondary",
  outline: "Outline",
  ghost: "Ghost",
  link: "Link",
  destructive: "Destructive",
};

export function Buttons() {
  return (
    <div className="flex flex-col gap-6">
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
            <Button
              key={variant}
              variant={variant}
              size="lg"
            >
              {variantLabels[variant]}
            </Button>
          ))}
        </ButtonGroup>
      </Section>

      <Section>
        <SectionHeader>Size: icon-xs</SectionHeader>
        <ButtonGroup>
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} size="icon-xs">
              <PlusIcon />
            </Button>
          ))}
        </ButtonGroup>
      </Section>

      <Section>
        <SectionHeader>Size: icon-sm</SectionHeader>
        <ButtonGroup>
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} size="icon-sm">
              <PlusIcon />
            </Button>
          ))}
        </ButtonGroup>
      </Section>

      <Section>
        <SectionHeader>Size: icon</SectionHeader>
        <ButtonGroup>
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} size="icon">
              <PlusIcon />
            </Button>
          ))}
        </ButtonGroup>
      </Section>

      <Section>
        <SectionHeader>Size: icon-lg</SectionHeader>
        <ButtonGroup>
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} size="icon-lg">
              <PlusIcon />
            </Button>
          ))}
        </ButtonGroup>
      </Section>
    </div>
  );
}
