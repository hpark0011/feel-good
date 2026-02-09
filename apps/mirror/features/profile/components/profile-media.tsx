export function ProfileMedia() {
  return (
    <div className="relative w-[200px] h-[200px] overflow-hidden rounded-t-full [corner-shape:superellipse(1.2)]">
      <video
        src="/portrait-video.mp4"
        poster="/rr.webp"
        preload="metadata"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
    </div>
  );
}
