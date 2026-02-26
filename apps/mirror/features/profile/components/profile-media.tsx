type ProfileMediaProps =
  | { video: string; poster: string; image?: never }
  | { image: string; video?: never; poster?: never };

export function ProfileMedia(props: ProfileMediaProps) {
  if (props.video) {
    return (
      <video
        src={props.video}
        poster={props.poster}
        preload="metadata"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover object-center"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={props.image}
      alt="Profile photo"
      className="absolute inset-0 w-full h-full object-cover"
    />
  );
}
