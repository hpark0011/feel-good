import { ShinyButton } from "@feel-good/ui/components/shiny-button";
import { Icon, type IconName } from "@feel-good/ui/components/icon";

export type ProfileActionId = "text" | "video" | "voice";

type ProfileAction = {
  id: ProfileActionId;
  label: string;
  icon: IconName;
  iconClassName?: string;
};

const PROFILE_ACTIONS: ProfileAction[] = [
  {
    id: "text",
    label: "Text",
    icon: "BubbleLeftFillIcon",
    iconClassName: "size-5.5",
  },
  {
    id: "video",
    label: "Video",
    icon: "VideoFillIcon",
    iconClassName: "size-5.5",
  },
  {
    id: "voice",
    label: "Voice",
    icon: "WaveformIcon",
    iconClassName: "size-6",
  },
];

const shinyButtonClass =
  "w-11 h-11 rounded-[20px] [corner-shape:superellipse(1.3)]";
const shinyButtonShadowClass =
  "rounded-[20px] [corner-shape:superellipse(1.3)]";

type ProfileActionsProps = {
  isEditing?: boolean;
  onAction?: (id: ProfileActionId) => void;
};

export function ProfileActions({ isEditing, onAction }: ProfileActionsProps) {
  return (
    <div className={`flex gap-2.5 items-center p-4 px-8 rounded-2xl ${isEditing ? "border" : "border border-transparent"}`}>
      {PROFILE_ACTIONS.map(({ id, label, icon, iconClassName }) => (
        <div key={id} className="flex flex-col gap-2">
          <ShinyButton
            className={shinyButtonClass}
            shadowClassName={shinyButtonShadowClass}
            onClick={() =>
              onAction?.(id)}
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
