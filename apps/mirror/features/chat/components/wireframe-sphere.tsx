import "./wireframe-sphere.css";
import { cn } from "@feel-good/utils/cn";

const RING_COUNT = 15;
const RING_STEP = 180 / RING_COUNT; // 15°

function WireframeSphere({ className }: { className?: string }) {
  return (
    <div
      data-slot="wireframe-sphere"
      className={cn("size-[152px] text-primary", className)}
      style={{
        perspective: "1000px",
        perspectiveOrigin: "0% -50%",
      }}
    >
      <div
        className="relative size-full"
        style={{
          transformStyle: "preserve-3d",
          animation: "wireframe-sphere-rotate 20s linear infinite",
        }}
      >
        {/* Longitude rings */}
        {Array.from({ length: RING_COUNT }, (_, i) => (
          <div
            key={i}
            className="absolute inset-0 rounded-full"
            style={{
              transform: `rotateY(${i * RING_STEP}deg)`,
              transformStyle: "preserve-3d",
              border:
                "1.5px solid color-mix(in srgb, currentColor 15%, transparent)",
              backgroundColor:
                "color-mix(in srgb, currentColor 0.1%, transparent)",
              boxShadow:
                "0 0 1px color-mix(in srgb, currentColor 0%, transparent), 0px 2px 3px -5px rgba(0,0,0,0.25)",
            }}
          />
        ))}

        {/* Equator ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            border:
              "2.5px solid color-mix(in srgb, currentColor 15%, transparent)",
            transform: "rotateX(90deg)",
            transformStyle: "preserve-3d",
          }}
        />
      </div>
    </div>
  );
}

export { WireframeSphere };
