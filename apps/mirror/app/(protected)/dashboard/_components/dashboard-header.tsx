"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ThemeToggleButton } from "@feel-good/features/theme/components";
import { cn } from "@feel-good/utils/cn";

type DashboardHeaderProps = {
  className?: string;
};

export function DashboardHeader({ className }: DashboardHeaderProps) {
  const pathname = usePathname();
  const isArticleDetail = pathname.startsWith("/dashboard/articles/");

  return (
    <header
      className={cn(
        "z-10 flex h-10 items-center gap-2 px-4 bg-linear-to-b from-background via-background/70 to-transparent",
        isArticleDetail ? "justify-between" : "justify-end",
        className,
      )}
    >
      {isArticleDetail && (
        <Link
          href="/dashboard"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Link>
      )}
      <ThemeToggleButton />
    </header>
  );
}
