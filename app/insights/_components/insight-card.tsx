import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { RingPercentage } from "./ring-percentage";
import { InsightHeaderBadgeWrapper } from "./insight-components";
import {
  INSIGHT_VARIANTS,
  type InsightActionType,
} from "@/config/insight-variants";

export function InsightCard({
  user,
  match,
  actionType,
}: {
  user: string;
  match: number;
  actionType: InsightActionType;
}) {
  const variant = INSIGHT_VARIANTS[actionType];

  return (
    <div
      className={cn(
        "rounded-xl w-full flex flex-col items-start relative  transition-all duration-200 translate-y-0 scale-100 ease-out group hover:translate-y-[-1px] hover:shadow-lg hover:border-opacity-100 hover:scale-[1.02] cursor-pointer inset-shadow-[0_0_0_1px_rgba(255,255,255,1)] p-1 bg-white"
      )}
    >
      <div
        className={cn(
          "text-text-tertiary text-sm flex items-center gap-0.5 min-w-[130px] justify-start px-2.5 py-0.5 w-full pb-1.5"
        )}
      >
        <div className='flex items-center gap-2 w-full'>
          <div className={cn("flex items-center gap-0.5")}>
            <Icon
              name={variant.icon}
              className={cn(
                "size-5.5 min-w-5.5 mr-1 rounded-full p-0.5",
                variant.iconColorClasses
              )}
            />
            <span className='whitespace-nowrap'>{variant.headerText}</span>
          </div>

          {actionType === "contact" && (
            <InsightHeaderBadgeWrapper>
              <Avatar className='size-5'>
                <AvatarFallback className='bg-dq-gray-900 text-text-primary-inverse text-[10px]'>
                  CN
                </AvatarFallback>
              </Avatar>
              <div className='flex flex-col gap-0 min-w-0'>
                <div className='text-text-strong text-sm'>{user}</div>
              </div>
              <div className='w-px bg-neutral-100 self-stretch mx-1' />
              <RingPercentage value={match} />
            </InsightHeaderBadgeWrapper>
          )}

          {actionType === "create-content" && (
            <InsightHeaderBadgeWrapper className='pl-2'>
              # Healthy diet
              <div className='w-px bg-neutral-100 self-stretch mx-1' />
              <RingPercentage value={match} />
            </InsightHeaderBadgeWrapper>
          )}
          {actionType === "add-data" && (
            <InsightHeaderBadgeWrapper className='gap-1'>
              <Icon
                name={variant.badgeIcon ?? variant.icon}
                className='size-5'
              />
            </InsightHeaderBadgeWrapper>
          )}
        </div>
      </div>

      <div className='text-text-primary px-2.5 py-3 border-neutral-100 border border-px w-full rounded-[12px] bg-white flex items-start gap-1 '>
        <Icon
          name='LightbulbFillIcon'
          className='size-4.5 text-icon-light min-w-4.5 mt-[1px]'
        />
        <p className='text-text-strong text-md leading-[1.2] pl-0.5'>
          Rising engagement with your guidence on{" "}
          <span className='text-[#FF5C02]'>improving sleep</span>
          and optimizing daily routines. Rising engagement with your guidence on{" "}
          <span className='text-[#FF5C02]'>improving sleep</span> and optimizing
          daily routines.
        </p>
      </div>
    </div>
  );
}
