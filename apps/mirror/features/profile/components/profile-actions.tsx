import { ShinyButton } from "@feel-good/ui/components/shiny-button";
import { Icon, type IconName } from "@feel-good/ui/components/icon";

const PROFILE_ACTIONS: { label: string; icon: IconName; iconClassName?: string }[] = [
  { label: "Text", icon: "BubbleLeftFillIcon", iconClassName: "size-5.5" },
  { label: "Video", icon: "VideoFillIcon", iconClassName: "size-5.5" },
  { label: "Voice", icon: "WaveformIcon", iconClassName: "size-6" },
];

const shinyButtonClass =
  "w-11 h-11 rounded-[20px] [corner-shape:superellipse(1.3)]";
const shinyButtonShadowClass =
  "rounded-[20px] [corner-shape:superellipse(1.3)]";

export function ProfileActions() {
  return (
    <div className="flex gap-2.5 items-center">
      {PROFILE_ACTIONS.map(({ label, icon, iconClassName }) => (
        <div key={label} className="flex flex-col gap-2">
          <ShinyButton
            className={shinyButtonClass}
            shadowClassName={shinyButtonShadowClass}
          >
            <Icon name={icon} className={iconClassName} />
          </ShinyButton>
          <span className="text-sm text-center text-muted-foreground">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
