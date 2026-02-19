"use client";

import Link from "next/link";
import { Icon } from "@feel-good/ui/components/icon";

type ArticleDetailToolbarProps = {
  username: string;
};

export function ArticleDetailToolbar({ username }: ArticleDetailToolbarProps) {
  return (
    <div className="flex h-10 items-center px-4.5 bg-background">
      <Link
        href={`/@${username}`}
        className="flex items-center gap-0.5 text-[14px] text-muted-foreground hover:text-foreground group"
      >
        <Icon
          name="ArrowLeftCircleFillIcon"
          className="size-6 text-icon group-hover:text-foreground"
        />
        <span className="leading-[1.2]">Back</span>
      </Link>
    </div>
  );
}
