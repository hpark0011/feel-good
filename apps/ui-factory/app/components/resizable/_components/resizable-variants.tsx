"use client";

import { Divider } from "@/components/divider";
import { PageSection } from "@/components/page-section";
import { PageSectionHeader } from "@/components/page-section-header";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@feel-good/ui/primitives/resizable";

export function ResizableVariants() {
  return (
    <div className="flex flex-col w-full pb-24">
      <Divider />

      <PageSection>
        <PageSectionHeader>Horizontal</PageSectionHeader>
        <div className="rounded-4xl [corner-shape:superellipse(1.2)] border h-[200px] w-full">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={50} minSize={20}>
              <div className="flex h-full items-center justify-center p-6">
                <span className="font-medium text-muted-foreground">
                  Panel One
                </span>
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50} minSize={20}>
              <div className="flex h-full items-center justify-center p-6">
                <span className="font-medium text-muted-foreground">
                  Panel Two
                </span>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </PageSection>

      <Divider />

      <PageSection>
        <PageSectionHeader>Vertical</PageSectionHeader>
        <div className="rounded-4xl [corner-shape:superellipse(1.2)] border h-[300px] w-full">
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={50} minSize={20}>
              <div className="flex h-full items-center justify-center p-6">
                <span className="font-medium text-muted-foreground">
                  Top Panel
                </span>
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50} minSize={20}>
              <div className="flex h-full items-center justify-center p-6">
                <span className="font-medium text-muted-foreground">
                  Bottom Panel
                </span>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </PageSection>

      <Divider />

      <PageSection>
        <PageSectionHeader>With Handle</PageSectionHeader>
        <div className="rounded-4xl [corner-shape:superellipse(1.2)] border h-[200px] w-full">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={50} minSize={20}>
              <div className="flex h-full items-center justify-center p-6">
                <span className="font-medium text-muted-foreground">
                  Panel One
                </span>
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={50} minSize={20}>
              <div className="flex h-full items-center justify-center p-6">
                <span className="font-medium text-muted-foreground">
                  Panel Two
                </span>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </PageSection>

      <Divider />

      <PageSection>
        <PageSectionHeader>Nested</PageSectionHeader>
        <div className="rounded-4xl [corner-shape:superellipse(1.2)] border h-[300px] w-full">
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={50} minSize={20}>
              <div className="flex h-full items-center justify-center p-6">
                <span className="font-medium text-muted-foreground leading-[1.3]">
                  Left Panel
                </span>
              </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={50} minSize={20}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={50} minSize={20}>
                  <div className="flex h-full items-center justify-center p-6">
                    <span className="font-medium text-muted-foreground leading-[1.3]">
                      Top Right
                    </span>
                  </div>
                </ResizablePanel>
                <ResizableHandle />
                <ResizablePanel defaultSize={50} minSize={20}>
                  <div className="flex h-full items-center justify-center p-6">
                    <span className="font-medium text-muted-foreground leading-[1.3]">
                      Bottom Right
                    </span>
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </PageSection>
    </div>
  );
}
