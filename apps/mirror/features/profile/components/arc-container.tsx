type ArcContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export function ArcContainer({ children, className }: ArcContainerProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-t-full [corner-shape:superellipse(1.2)] ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
