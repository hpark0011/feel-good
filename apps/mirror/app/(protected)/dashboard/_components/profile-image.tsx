import Image from "next/image";

export function ProfileImage() {
  return (
    <div
      className="relative w-[200px] h-[200px] rounded-t-full overflow-hidden"
      style={{ cornerShape: "superellipse(1.2)" } as React.CSSProperties}
    >
      <Image
        src="/rr-2x.jpeg"
        alt="Profile"
        fill
        className="object-cover object-center"
        priority
        quality={95}
      />
    </div>
  );
}
