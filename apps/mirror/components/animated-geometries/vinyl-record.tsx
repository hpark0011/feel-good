import "./vinyl-record.css";
import { cn } from "@feel-good/utils/cn";
import { GeometryScene } from "./geometry-scene";

/** Spinning vinyl record geometry. */
function VinylRecord({ className }: { className?: string }) {
  return (
    <GeometryScene
      slot="vinyl-record"
      className={cn("size-[40px]", className)}
      perspective="none"
      stageStyle={{}}
    >
      <div className="vinyl-record">
        <div className="vinyl-record-shine" />
        <div className="vinyl-record-label">
          <div className="vinyl-record-spindle" />
        </div>
      </div>
    </GeometryScene>
  );
}

export { VinylRecord };
