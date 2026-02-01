import { ButtonGroupWrapper } from "@/app/components/buttons/_components/button-group-wrapper";
import { ComponentsSection } from "@/app/components/_components/components-section";
import { ComponentsSectionHeader } from "@/app/components/_components/components-section-header";
import { Divider } from "@/components/divider";
import { Button } from "@feel-good/ui/primitives/button";
import { PlusIcon } from "lucide-react";
import { BUTTON_VARIANTS } from "../_utils/button-variants.config";

const variantLabels: Record<(typeof BUTTON_VARIANTS)[number], string> = {
  default: "Default",
  primary: "Primary",
  secondary: "Secondary",
  outline: "Outline",
  ghost: "Ghost",
  link: "Link",
  destructive: "Destructive",
};

export function ButtonVariants() {
  return (
    <div className="flex flex-col w-full">
      <Divider />

      <ComponentsSection>
        <ComponentsSectionHeader>Size: xs</ComponentsSectionHeader>
        <ButtonGroupWrapper>
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} size="xs">
              {variantLabels[variant]}
            </Button>
          ))}
        </ButtonGroupWrapper>
      </ComponentsSection>

      <Divider />

      <ComponentsSection>
        <ComponentsSectionHeader>Size: sm</ComponentsSectionHeader>
        <ButtonGroupWrapper>
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} size="sm">
              {variantLabels[variant]}
            </Button>
          ))}
        </ButtonGroupWrapper>
      </ComponentsSection>

      <Divider />

      <ComponentsSection>
        <ComponentsSectionHeader>Size: default</ComponentsSectionHeader>
        <ButtonGroupWrapper>
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant}>
              {variantLabels[variant]}
            </Button>
          ))}
        </ButtonGroupWrapper>
      </ComponentsSection>

      <Divider />

      <ComponentsSection>
        <ComponentsSectionHeader>Size: lg</ComponentsSectionHeader>
        <ButtonGroupWrapper>
          {BUTTON_VARIANTS.map((variant) => (
            <Button
              key={variant}
              variant={variant}
              size="lg"
            >
              {variantLabels[variant]}
            </Button>
          ))}
        </ButtonGroupWrapper>
      </ComponentsSection>

      <Divider />

      <ComponentsSection>
        <ComponentsSectionHeader>Size: icon-xs</ComponentsSectionHeader>
        <ButtonGroupWrapper>
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} size="icon-xs">
              <PlusIcon />
            </Button>
          ))}
        </ButtonGroupWrapper>
      </ComponentsSection>

      <Divider />

      <ComponentsSection>
        <ComponentsSectionHeader>Size: icon-sm</ComponentsSectionHeader>
        <ButtonGroupWrapper>
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} size="icon-sm">
              <PlusIcon />
            </Button>
          ))}
        </ButtonGroupWrapper>
      </ComponentsSection>

      <Divider />

      <ComponentsSection>
        <ComponentsSectionHeader>Size: icon</ComponentsSectionHeader>
        <ButtonGroupWrapper>
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} size="icon">
              <PlusIcon />
            </Button>
          ))}
        </ButtonGroupWrapper>
      </ComponentsSection>

      <Divider />

      <ComponentsSection>
        <ComponentsSectionHeader>Size: icon-lg</ComponentsSectionHeader>
        <ButtonGroupWrapper>
          {BUTTON_VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} size="icon-lg">
              <PlusIcon />
            </Button>
          ))}
        </ButtonGroupWrapper>
      </ComponentsSection>

      <Divider />
    </div>
  );
}
