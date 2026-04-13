import { HeptagonalPrism } from "@/components/animated-geometries/heptagonal-prism";

export function EmptyMessage({
  message,
  showGraphic = false,
}: {
  message?: string;
  showGraphic?: boolean;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 pb-16 text-muted-foreground">
      {showGraphic && <HeptagonalPrism />}
      <p>{message}</p>
    </div>
  );
}
