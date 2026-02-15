import { ArcContainer } from "./arc-container";

type ProfileMediaProps = {
  video: string;
  poster: string;
};

export function ProfileMedia({ video, poster }: ProfileMediaProps) {
  return (
    <ArcContainer className="w-[200px] h-[200px]">
      <video
        src={video}
        poster={poster}
        preload="metadata"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full max-w-[200px] h-full max-h-[200px] object-cover object-center"
      />
    </ArcContainer>
  );
}
