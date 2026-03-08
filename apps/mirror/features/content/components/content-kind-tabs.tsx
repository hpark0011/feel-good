"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@feel-good/ui/primitives/tabs";
import { useChatSearchParams } from "@/hooks/use-chat-search-params";
import {
  CONTENT_KIND_LABELS,
  CONTENT_KINDS,
  type ContentKind,
  getContentHref,
  isContentKind,
} from "../types";

type ContentKindTabsProps = {
  username: string;
  currentKind: ContentKind;
};

export function ContentKindTabs({
  username,
  currentKind,
}: ContentKindTabsProps) {
  const router = useRouter();
  const { buildChatAwareHref } = useChatSearchParams();

  return (
    <Tabs
      value={currentKind}
      onValueChange={(nextKind) => {
        if (!isContentKind(nextKind) || nextKind === currentKind) {
          return;
        }

        startTransition(() => {
          router.push(buildChatAwareHref(getContentHref(username, nextKind)));
        });
      }}
    >
      <TabsList variant="folder">
        {CONTENT_KINDS.map((kind) => (
          <TabsTrigger
            key={kind}
            value={kind}
            className="group-data-[variant=folder]/tabs-list:before:border-border-subtle h-8"
          >
            {CONTENT_KIND_LABELS[kind]}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
