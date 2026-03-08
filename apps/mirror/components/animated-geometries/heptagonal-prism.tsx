import "./heptagonal-prism.css";
import { cn } from "@feel-good/utils/cn";

const SIDE_COUNT = 7;
const ANGLE_STEP = (2 * Math.PI) / SIDE_COUNT;
const ARC_WIDTH = 160;
const ARC_HEIGHT = 220;
const RADIUS = ARC_WIDTH / (2 * Math.tan(Math.PI / SIDE_COUNT));

function HeptagonalPrism({ className }: { className?: string }) {
  return (
    <div
      data-slot="heptagonal-prism"
      className={cn("size-[280px] text-primary", className)}
      style={{ perspective: "1200px" }}
    >
      <div
        className="relative size-full"
        style={{
          transformStyle: "preserve-3d",
          animation: "heptagonal-prism-spin 15s linear infinite",
        }}
      >
        {Array.from({ length: SIDE_COUNT }, (_, i) => {
          const angle = ANGLE_STEP * i;
          return (
            <div
              key={i}
              className="pointer-events-none absolute left-1/2 top-1/2"
              style={{
                width: `${ARC_WIDTH}px`,
                height: `${ARC_HEIGHT}px`,
                marginLeft: `${-ARC_WIDTH / 2}px`,
                marginTop: `${-ARC_HEIGHT / 2}px`,
                transform: `rotateY(${(angle * 180) / Math.PI}deg) translateZ(${RADIUS}px)`,
                transformStyle: "preserve-3d",
                backgroundColor:
                  "color-mix(in srgb, currentColor 4%, transparent)",
                border:
                  "1px solid color-mix(in srgb, currentColor 15%, transparent)",
                boxShadow:
                  "inset 0 0 20px color-mix(in srgb, currentColor 3%, transparent)",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export { HeptagonalPrism };
