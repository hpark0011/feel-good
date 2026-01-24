import {
  CylinderSplit1x2FillIcon,
  HandWaveFillIcon,
  SquareTextSquareFillIcon,
} from "@feel-good/icons";
import type { ComponentType, SVGProps } from "react";

export type InsightActionType = "contact" | "create-content" | "add-data";

type InsightVariant = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconColorClasses: string; // applied to the header icon (e.g., text + bg color)
  headerText: string;
  badgeIcon?: ComponentType<SVGProps<SVGSVGElement>>; // optional icon for the badge area when needed
};

export const INSIGHT_VARIANTS: Record<InsightActionType, InsightVariant> = {
  contact: {
    icon: HandWaveFillIcon,
    iconColorClasses:
      "text-[var(--color-dq-blue-500)] bg-[var(--color-dq-blue-100)]",
    headerText: "Reach out to",
  },
  "create-content": {
    icon: SquareTextSquareFillIcon,
    badgeIcon: SquareTextSquareFillIcon,
    iconColorClasses:
      "text-[var(--color-dq-red-600)] bg-[var(--color-dq-red-100)]",
    headerText: "Create content on",
  },
  "add-data": {
    icon: CylinderSplit1x2FillIcon,
    badgeIcon: CylinderSplit1x2FillIcon,
    iconColorClasses:
      "text-[var(--color-dq-yellow-500)] bg-[var(--color-dq-yellow-100)]",
    headerText: "Set",
  },
};
