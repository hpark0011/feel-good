export function ProfileImage() {
  return (
    <div
      className="relative w-[200px] h-[200px] rounded-t-full overflow-hidden"
      style={{ cornerShape: "superellipse(1.2)" } as React.CSSProperties}
    >
      <video
        src="/portrait-video.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
    </div>
  );
}
