"use client";

import { Divider } from "@/components/divider";
import { PageSection } from "@/components/page-section";
import { PageSectionHeader } from "@/components/page-section-header";
import { Button } from "@feel-good/ui/primitives/button";
import { Toaster } from "@feel-good/ui/primitives/sonner";
import { toast } from "sonner";

export function SonnerVariants() {
  return (
    <div className="flex flex-col w-full">
      <Toaster />

      <Divider />

      <PageSection>
        <PageSectionHeader>Type: Default</PageSectionHeader>
        <Button variant="outline" onClick={() => toast("This is a default toast")}>
          Show Default Toast
        </Button>
      </PageSection>

      <Divider />

      <PageSection>
        <PageSectionHeader>Type: Success</PageSectionHeader>
        <Button
          variant="outline"
          onClick={() => toast.success("Action completed successfully")}
        >
          Show Success Toast
        </Button>
      </PageSection>

      <Divider />

      <PageSection>
        <PageSectionHeader>Type: Error</PageSectionHeader>
        <Button
          variant="outline"
          onClick={() => toast.error("Something went wrong")}
        >
          Show Error Toast
        </Button>
      </PageSection>

      <Divider />

      <PageSection>
        <PageSectionHeader>Type: Warning</PageSectionHeader>
        <Button
          variant="outline"
          onClick={() => toast.warning("Please review before continuing")}
        >
          Show Warning Toast
        </Button>
      </PageSection>

      <Divider />

      <PageSection>
        <PageSectionHeader>Type: Info</PageSectionHeader>
        <Button
          variant="outline"
          onClick={() => toast.info("Here is some useful information")}
        >
          Show Info Toast
        </Button>
      </PageSection>

      <Divider />

      <PageSection>
        <PageSectionHeader>Type: Loading</PageSectionHeader>
        <Button
          variant="outline"
          onClick={() => toast.loading("Loading data...")}
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
            toast("File deleted", {
              action: {
                label: "Undo",
                onClick: () => toast.success("File restored"),
              },
            })
          }
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
            toast("Event created", {
              description: "Monday, January 3rd at 6:00 PM",
            })
          }
        >
          Show Description Toast
        </Button>
      </PageSection>
    </div>
  );
}
