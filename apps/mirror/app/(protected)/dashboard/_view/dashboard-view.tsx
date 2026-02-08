import { ProfileImage } from "@/app/(protected)/dashboard/_components/profile-image";

export function DashboardView() {
  return (
    <div className="w-full flex flex-col items-center ">
      <div className="text-3xl font-medium text-center mt-[100px]">
        Rick Rubin
      </div>

      <div className="flex flex-col gap-2 items-center pt-[100px]">
        <ProfileImage />
      </div>

      <div className="text-lg text-center max-w-md mx-auto mt-[120px] leading-[1.3]">
        Rick Rubin has been a singular, transformative creative muse for artists
        across genres and generations — from the Beastie Boys to Johnny Cash,
        from Public Enemy to the Red Hot Chili Peppers, from Adele to Jay-Z.
      </div>
    </div>
  );
}
