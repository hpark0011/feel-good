import type { Profile } from "../lib/mock-profile";
import { ProfileMedia } from "../components/profile-media";
import { ShinyButton } from "@feel-good/ui/components/shiny-button";
import { Icon } from "@feel-good/ui/components/icon";

type ProfileInfoViewProps = {
  profile: Profile;
};

export function ProfileInfoView({ profile }: ProfileInfoViewProps) {
  return (
    <div className="flex flex-col items-center justify-center pb-[40px]">
      {/* Profile Name */}
      <div className="text-3xl font-medium text-center">{profile.name}</div>

      {/* Profile Image */}
      <div className="flex flex-col gap-2 items-center pt-[64px]">
        <ProfileMedia
          video={profile.media.video}
          poster={profile.media.poster}
        />
      </div>

      {/* Profile Actions */}
      <div className="flex gap-2.5 items-center mt-[20px]">
        <div className="flex flex-col gap-2">
          <ShinyButton
            className="w-12 h-12 rounded-[20px] [corner-shape:superellipse(1.3)]"
            shadowClassName="rounded-[20px] [corner-shape:superellipse(1.3)]"
          >
            <Icon name="BubbleLeftFillIcon" className="size-5.5" />
          </ShinyButton>
          <span className="text-sm text-center text-muted-foreground">
            Text
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <ShinyButton
            className="w-12 h-12 rounded-[20px] [corner-shape:superellipse(1.3)]"
            shadowClassName="rounded-[20px] [corner-shape:superellipse(1.3)]"
          >
            <Icon name="VideoFillIcon" className="size-5.5" />
          </ShinyButton>
          <span className="text-sm text-center text-muted-foreground">
            Video
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <ShinyButton
            className="w-12 h-12 rounded-[20px] [corner-shape:superellipse(1.3)]"
            shadowClassName="rounded-[20px] [corner-shape:superellipse(1.3)]"
          >
            <Icon name="WaveformIcon" className="size-6" />
          </ShinyButton>
          <span className="text-sm text-center text-muted-foreground">
            Voice
          </span>
        </div>
      </div>

      {/* Profile Bio */}
      <div className="text-lg text-center max-w-md mx-auto mt-[64px] leading-[1.3]">
        {profile.bio}
      </div>
    </div>
  );
}
