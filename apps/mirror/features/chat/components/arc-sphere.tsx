import "./arc-sphere.css";
import { cn } from "@feel-good/utils/cn";

const LAYER_COUNT = 11;
const MIDDLE = Math.floor(LAYER_COUNT / 2); // 5

/** Z-offset, scale, and animation delay for each layer (back → front). */
function layerStyle(index: number): React.CSSProperties {
  const distFromMiddle = Math.abs(index - MIDDLE);
  const z = (index - MIDDLE) * 24; // –120 … 0 … +120
  // Scale: 1.0 at centre, shrinking toward edges
  const scale = [0.45, 0.65, 0.82, 0.92, 0.98, 1.0][MIDDLE - distFromMiddle];
  // Stagger delay so the wave ripples front-to-back
  const delay = index * 0.1;

  return {
    transform: `translateZ(${z}px) scale(${scale})`,
    animationDelay: `${delay}s`,
  };
}

function ArcSphere({ className }: { className?: string }) {
  return (
    <div
      data-slot="arc-sphere"
      className={cn("size-[200px] text-primary", className)}
      style={{ perspective: "2400px" }}
    >
      <div
        className="relative size-full"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(45deg) rotateY(-45deg)",
          top: "-24px",
        }}
      >
        {Array.from({ length: LAYER_COUNT }, (_, i) => (
          <div
            key={i}
            className="pointer-events-none absolute inset-0 box-border"
            style={{
              border: "1px solid currentColor",
              backgroundColor:
                "color-mix(in srgb, currentColor 30%, transparent)",
              borderTopLeftRadius: "50% 50%",
              borderTopRightRadius: "50% 50%",
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              boxShadow:
                "0 0 10px color-mix(in srgb, currentColor 10%, transparent)",
              transformOrigin: "bottom",
              transformStyle: "preserve-3d",
              animation: "arc-sphere-wave 2s ease-in-out infinite",
              ...layerStyle(i),
            }}
          />
        ))}
      </div>
    </div>
  );
}

export { ArcSphere };
