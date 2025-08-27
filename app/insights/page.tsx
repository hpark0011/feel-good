import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import React from "react";

export default function InsightsPage() {
  return (
    <div className='flex flex-col max-w-3xl mx-auto w-full gap-4'>
      <h1 className='text-2xl font-medium w-full flex items-center justify-center mb-8'>
        Good afternoon, Han
      </h1>

      <TrendGroupWrapper>
        <div className='text-text-muted text-sm w-full flex items-center gap-1'>
          <Icon name='SparkleIcon' className='size-5 text-icon-light -ml-1' />{" "}
          Top actions
        </div>
        <div className='space-y-3'>
          <div className='text-text-strong text-lg w-full'>
            Take these actions to get more opportunities.
          </div>
          <div className='grid grid-cols-5 gap-2 w-[calc(100%+16px)] -ml-2'>
            <InsightsCardWrapper orientation='vertical' className='items-start'>
              <InsightsCardLabel>Chats Exchanged</InsightsCardLabel>
              <InsightsCardValueWrapper>
                <InsightsCardValue>232</InsightsCardValue>
                <GrowthRate isPositive>10%</GrowthRate>
              </InsightsCardValueWrapper>
            </InsightsCardWrapper>
            <InsightsCardWrapper orientation='vertical' className='items-start'>
              <InsightsCardLabel>Chats Exchanged</InsightsCardLabel>
              <InsightsCardValueWrapper>
                <InsightsCardValue>232</InsightsCardValue>
                <GrowthRate isPositive>10%</GrowthRate>
              </InsightsCardValueWrapper>
            </InsightsCardWrapper>
            <InsightsCardWrapper orientation='vertical' className='items-start'>
              <InsightsCardLabel>Chats Exchanged</InsightsCardLabel>
              <InsightsCardValueWrapper>
                <InsightsCardValue>232</InsightsCardValue>
                <GrowthRate isPositive>10%</GrowthRate>
              </InsightsCardValueWrapper>
            </InsightsCardWrapper>
            <InsightsCardWrapper orientation='vertical' className='items-start'>
              <InsightsCardLabel>Chats Exchanged</InsightsCardLabel>
              <InsightsCardValueWrapper>
                <InsightsCardValue>232</InsightsCardValue>
                <GrowthRate isPositive>10%</GrowthRate>
              </InsightsCardValueWrapper>
            </InsightsCardWrapper>
            <InsightsCardWrapper orientation='vertical' className='items-start'>
              <InsightsCardLabel>Chats Exchanged</InsightsCardLabel>
              <InsightsCardValueWrapper>
                <InsightsCardValue>232</InsightsCardValue>
                <GrowthRate isPositive>10%</GrowthRate>
              </InsightsCardValueWrapper>
            </InsightsCardWrapper>
          </div>
        </div>
      </TrendGroupWrapper>

      <TrendGroupWrapper>
        <div className='text-text-muted text-sm w-full flex items-center gap-1'>
          <Icon name='EyesIcon' className='size-5 text-icon-light -ml-1' />{" "}
          Noticeable users
        </div>
      </TrendGroupWrapper>

      <TrendGroupWrapper>
        <div className='text-text-muted text-sm w-full flex items-center gap-1'>
          <Icon
            name='QuoteOpeningIcon'
            className='size-5 text-icon-light -ml-1'
          />{" "}
          Interesting chats
        </div>
      </TrendGroupWrapper>

      <TrendGroupWrapper>
        <div className='text-text-muted text-sm w-full flex items-center gap-1'>
          <Icon
            name='TextBubbleFillIcon'
            className='size-5 text-icon-light -ml-1'
          />{" "}
          Summary of your clone
        </div>
        <div className='flex flex-col gap-6 w-full'>
          <div className='space-y-3'>
            <div className='text-text-strong text-lg w-full'>
              Your clone is getting more popular!
            </div>
            <div className='grid grid-cols-3 gap-2 w-[calc(100%+16px)] -ml-2'>
              <InsightsCardWrapper>
                <InsightsCardLabel>Chats Exchanged</InsightsCardLabel>
                <InsightsCardValueWrapper>
                  <InsightsCardValue>232</InsightsCardValue>
                  <GrowthRate isPositive>10%</GrowthRate>
                </InsightsCardValueWrapper>
              </InsightsCardWrapper>
              <InsightsCardWrapper>
                <InsightsCardLabel>Users Engaged</InsightsCardLabel>
                <InsightsCardValueWrapper>
                  <InsightsCardValue>24</InsightsCardValue>
                  <GrowthRate isPositive>10%</GrowthRate>
                </InsightsCardValueWrapper>
              </InsightsCardWrapper>
              <InsightsCardWrapper>
                <InsightsCardLabel>Actions Created</InsightsCardLabel>
                <InsightsCardValueWrapper>
                  <InsightsCardValue>8</InsightsCardValue>
                  <GrowthRate isPositive={false}>10%</GrowthRate>
                </InsightsCardValueWrapper>
              </InsightsCardWrapper>
            </div>
          </div>

          <div className='space-y-3'>
            <div className='text-text-strong text-lg leading-[140%]'>
              <span className='flex items-center gap-1'>
                Your audience is{" "}
                <Icon
                  name='LineUpTrendIcon'
                  className='size-4.5 text-green-600'
                />{" "}
                engaing more with health related topics.{" "}
              </span>
              <span className='flex items-center gap-1'>
                Career guidance and motivation are on the{" "}
                <Icon
                  name='LineDownTrendIcon'
                  className='size-4.5 text-red-600'
                />{" "}
                decline.
              </span>
            </div>
            <div className='flex w-[calc(100%+16px)] -ml-2'>
              <InsightsCardWrapper isHoverable={false} className='pt-2.5'>
                <div className='flex items-center gap-2 w-full'>
                  <div className='flex flex-col gap-1 w-full'>
                    <div className='text-sm text-text-muted mb-2 flex items-center gap-1 flex-row'>
                      <Icon name='LineUpTrendIcon' className='size-4.5' />
                      Trending up
                    </div>
                    <TrendItem>
                      # Healthy diet
                      <GrowthRate isPositive>74%</GrowthRate>
                    </TrendItem>
                    <TrendItem>
                      # Mindfulness and meditation
                      <GrowthRate isPositive>42%</GrowthRate>
                    </TrendItem>
                    <TrendItem>
                      # Creating a routine
                      <GrowthRate isPositive>39%</GrowthRate>
                    </TrendItem>
                    <TrendItem>
                      # Creating a routine
                      <GrowthRate isPositive>22%</GrowthRate>
                    </TrendItem>
                  </div>
                  <div className='w-px min-w-[1px] bg-extra-light self-stretch shrink-0 mx-2' />
                  <div className='flex flex-col gap-1 w-full self-stretch'>
                    <div className='text-sm text-text-muted mb-2 flex items-center gap-1 flex-row'>
                      <Icon name='LineDownTrendIcon' className='size-4.5' />
                      Trending down
                    </div>
                    <TrendItem>
                      # Career guidance
                      <GrowthRate isPositive={false}>56%</GrowthRate>
                    </TrendItem>
                    <TrendItem>
                      # Motivation
                      <GrowthRate isPositive={false}>47%</GrowthRate>
                    </TrendItem>
                    <TrendItem>
                      # Motivation
                      <GrowthRate isPositive={false}>10%</GrowthRate>
                    </TrendItem>
                  </div>
                </div>
              </InsightsCardWrapper>
            </div>
          </div>
        </div>
      </TrendGroupWrapper>
    </div>
  );
}

export function TrendGroupWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className='py-3.5 pt-3 px-5 border border-light rounded-3xl gap-6 flex flex-col w-full'>
      {children}
    </div>
  );
}

export function TrendItem({ children }: { children: React.ReactNode }) {
  return (
    <div className='text-text-strong text-sm w-full flex items-center justify-between'>
      {children}
    </div>
  );
}

export function InsightsCardWrapper({
  children,
  isHoverable = true,
  className,
  orientation = "horizontal",
}: {
  children: React.ReactNode;
  isHoverable?: boolean;
  className?: string;
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <div
      className={cn(
        "rounded-xl w-full border p-4 py-3 flex flex-row justify-between items-center relative  transition-all duration-200 translate-y-0  scale-100 ease-out group bg-white/30 border-white/30  gap-0 inset-shadow-none shadow-xs",
        orientation === "vertical" && "flex-col",
        className,
        isHoverable &&
          "hover:bg-base hover:shadow-[0_12px_12px_-6px_rgba(255,255,255,0.9),_0_14px_14px_-6px_rgba(0,0,0,0.3) hover:translate-y-[-1px] hover:border-opacity-100 hover:scale-[1.02] "
      )}
    >
      {children}
    </div>
  );
}

export function InsightsCardLabel({ children }: { children: React.ReactNode }) {
  return <div className='text-sm text-text-tertiary'>{children}</div>;
}

export function InsightsCardValueWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex flex-row items-baseline justify-between gap-2'>
      {children}
    </div>
  );
}

export function InsightsCardValue({ children }: { children: React.ReactNode }) {
  return <div className='text-xl font-medium'>{children}</div>;
}

export function GrowthRate({
  children,
  isPositive,
}: {
  children: React.ReactNode;
  isPositive: boolean;
}) {
  return (
    <div
      className={cn(
        "text-sm text-text-tertiary",
        isPositive ? "text-green-600" : "text-red-600"
      )}
    >
      {isPositive ? "+" : "-"}
      {children}
    </div>
  );
}
