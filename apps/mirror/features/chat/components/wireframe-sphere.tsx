import "./wireframe-sphere.css";
import { cn } from "@feel-good/utils/cn";

const RING_COUNT = 18;
const RING_STEP = 180 / RING_COUNT; // 15°

function WireframeSphere({ className }: { className?: string }) {
  return (
    <div
      data-slot="wireframe-sphere"
      className={cn("size-28 text-primary", className)}
      style={{
        perspective: "1000px",
      }}
    >
      <div
        className="relative size-full"
        style={{
          transformStyle: "preserve-3d",
          animation: "wireframe-sphere-rotate 12s linear infinite",
        }}
      >
        {/* Longitude rings */}
        {Array.from({ length: RING_COUNT }, (_, i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full"
            style={{
              border:
                "1px solid color-mix(in srgb, currentColor 30%, transparent)",
              transform: `rotateY(${i * RING_STEP}deg)`,
              transformStyle: "preserve-3d",
            }}
          />
        ))}

        {/* Equator ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border:
              "1px dashed color-mix(in srgb, currentColor 30%, transparent)",
            transform: "rotateX(90deg)",
            transformStyle: "preserve-3d",
          }}
        />
      </div>
    </div>
  );
}

export { WireframeSphere };
