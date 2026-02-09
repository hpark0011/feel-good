import { ProfileImage } from "@/app/(protected)/dashboard/_components/profile-image";

export function ProfileInfoView() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center border-r border-border-subtle pb-[80px]">
      {/* Profile Name */}
      <div className="text-3xl font-medium text-center">
        Rick Rubin
      </div>

      {/* Profile Image */}
      <div className="flex flex-col gap-2 items-center pt-[80px]">
        <ProfileImage />
      </div>

      {/* Profile Bio */}
      <div className="text-lg text-center max-w-md mx-auto mt-[88px] leading-[1.3]">
        Rick Rubin has been a singular, transformative creative muse for artists
        across genres and generations — from the Beastie Boys to Johnny Cash,
        from Public Enemy to the Red Hot Chili Peppers, from Adele to Jay-Z.
      </div>
    </div>
  );
}
