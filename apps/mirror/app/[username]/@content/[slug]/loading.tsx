import { ArcSphere } from "@/components/animated-geometries/arc-sphere";

export default function ArticleDetailLoading() {
  return (
    <div className="flex items-center justify-center bg-background h-[calc(100%-80px)]">
      <ArcSphere />
    </div>
  );
}
