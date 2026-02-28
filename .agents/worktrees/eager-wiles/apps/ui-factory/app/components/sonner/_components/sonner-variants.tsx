"use client";

import { Divider } from "@/components/divider";
import { PageSection } from "@/components/page-section";
import { PageSectionHeader } from "@/components/page-section-header";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastHeader,
  ToastIcon,
  ToastTitle,
} from "@feel-good/ui/components/toast";
import { Button } from "@feel-good/ui/primitives/button";
import { Toaster } from "@feel-good/ui/primitives/sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { toast } from "sonner";

export function SonnerVariants() {
  return (
    <div className="flex flex-col w-full">
      <Toaster />

      <Divider />

      <PageSection>
        <PageSectionHeader>Type: Default</PageSectionHeader>
        <Button
          variant="outline"
          onClick={() =>
            toast.custom((id) => (
              <Toast id={id}>
                <ToastHeader>
                  <ToastTitle>This is a default toast</ToastTitle>
                </ToastHeader>
                <ToastClose />
              </Toast>
            ))}
        >
          Show Default Toast
        </Button>
      </PageSection>

      <Divider />

      <PageSection>
        <PageSectionHeader>Type: Success</PageSectionHeader>
        <Button
          variant="outline"
          onClick={() =>
            toast.custom((id) => (
              <Toast id={id}>
                <ToastIcon className="text-green-9">
                  <CircleCheckIcon />
                </ToastIcon>
                <ToastHeader>
                  <ToastTitle>Action completed successfully</ToastTitle>
                  <ToastDescription>
                    Your changes have been saved
                  </ToastDescription>
                </ToastHeader>
                <ToastClose />
              </Toast>
            ))}
        >
          Show Success Toast
        </Button>
      </PageSection>

      <Divider />

      <PageSection>
        <PageSectionHeader>Type: Error</PageSectionHeader>
        <Button
          variant="outline"
          onClick={() =>
            toast.custom((id) => (
              <Toast id={id}>
                <ToastIcon className="text-red-9">
                  <OctagonXIcon />
                </ToastIcon>
                <ToastHeader>
                  <ToastTitle>Something went wrong</ToastTitle>
                  <ToastDescription>
                    Please try again later
                  </ToastDescription>
                </ToastHeader>
                <ToastClose />
              </Toast>
            ))}
        >
          Show Error Toast
        </Button>
      </PageSection>

      <Divider />

      <PageSection>
        <PageSectionHeader>Type: Warning</PageSectionHeader>
        <Button
          variant="outline"
          onClick={() =>
            toast.custom((id) => (
              <Toast id={id}>
                <ToastIcon className="text-amber-500">
                  <TriangleAlertIcon />
                </ToastIcon>
                <ToastHeader>
                  <ToastTitle>Please review before continuing</ToastTitle>
                </ToastHeader>
                <ToastClose />
              </Toast>
            ))}
        >
          Show Warning Toast
        </Button>
      </PageSection>

      <Divider />

      <PageSection>
        <PageSectionHeader>Type: Info</PageSectionHeader>
        <Button
          variant="outline"
          onClick={() =>
            toast.custom((id) => (
              <Toast id={id}>
                <ToastIcon className="text-blue-500">
                  <InfoIcon />
                </ToastIcon>
                <ToastHeader>
                  <ToastTitle>Here is some useful information</ToastTitle>
                </ToastHeader>
                <ToastClose />
              </Toast>
            ))}
        >
          Show Info Toast
        </Button>
      </PageSection>

      <Divider />

      <PageSection>
        <PageSectionHeader>Type: Loading</PageSectionHeader>
        <Button
          variant="outline"
          onClick={() =>
            toast.custom((id) => (
              <Toast id={id}>
                <ToastIcon className="text-muted-foreground">
                  <Loader2Icon className="animate-spin" />
                </ToastIcon>
                <ToastHeader>
                  <ToastTitle>Loading data...</ToastTitle>
                </ToastHeader>
              </Toast>
            ))}
        >
          Show Loading Toast
        </Button>
      </PageSection>

      <Divider />

      <PageSection>
        <PageSectionHeader>Type: Action</PageSectionHeader>
        <Button
          variant="outline"
          onClick={() =>
            toast.custom((id) => (
              <Toast id={id}>
                <ToastHeader>
                  <ToastTitle>File deleted</ToastTitle>
                </ToastHeader>
                <ToastAction
                  onClick={() =>
                    toast.custom((successId) => (
                      <Toast id={successId}>
                        <ToastIcon className="text-green-9">
                          <CircleCheckIcon />
                        </ToastIcon>
                        <ToastHeader>
                          <ToastTitle>File restored</ToastTitle>
                        </ToastHeader>
                        <ToastClose />
                      </Toast>
                    ))}
                >
                  Undo
                </ToastAction>
              </Toast>
            ))}
        >
          Show Action Toast
        </Button>
      </PageSection>

      <Divider />

      <PageSection>
        <PageSectionHeader>Type: Description</PageSectionHeader>
        <Button
          variant="outline"
          onClick={() =>
            toast.custom((id) => (
              <Toast id={id}>
                <ToastHeader>
                  <ToastTitle>Event created</ToastTitle>
                  <ToastDescription>
                    Monday, January 3rd at 6:00 PM
                  </ToastDescription>
                </ToastHeader>
                <ToastClose />
              </Toast>
            ))}
        >
          Show Description Toast
        </Button>
      </PageSection>
    </div>
  );
}
