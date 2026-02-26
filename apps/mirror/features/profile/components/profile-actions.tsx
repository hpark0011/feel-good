import { ShinyButton } from "@feel-good/ui/components/shiny-button";
import { Icon, type IconName } from "@feel-good/ui/components/icon";
import { Button } from "@feel-good/ui/primitives/button";
import { motion } from "framer-motion";

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
  onEdit?: () => void;
};

export function ProfileActions({
  isEditing,
  onAction,
  onEdit,
}: ProfileActionsProps) {
  return (
    <div className="flex flex-col w-full justify-center items-center gap-1">
      <label className="w-full text-start px-0.5 text-sm text-muted-foreground">
        <motion.div
          initial={{ opacity: 0, backgroundColor: "rgba(255,255,255,0)" }}
          animate={{ opacity: isEditing ? "100%" : "0%" }}
          transition={{ type: "spring", stiffness: 300, damping: 40 }}
          className="text-muted-foreground px-1"
        >
          Actions
        </motion.div>
      </label>
      <div
        className={`group/actions flex gap-2.5 items-center p-6 py-4 max-w-md w-full justify-center rounded-xl relative ${
          isEditing ? "border" : "border border-transparent"
        }`}
      >
        {isEditing && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Edit actions"
            onClick={onEdit}
            className="absolute top-2 right-2 rounded-full [corner-shape:superellipse(1.0)] opacity-0 group-hover/actions:opacity-100 transition-opacity [&_svg]:size-5.5"
          >
            <Icon name="PencilIcon" className="text-icon" />
          </Button>
        )}
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
    </div>
  );
}
