"use client";

import { usePathname } from "next/navigation";
import { NAVIGATION_ITEMS } from "@/config/navigation.config";

export function useComponentsPageTitle(fallback = "Component"): string {
  const pathname = usePathname();
  const currentPage = NAVIGATION_ITEMS.find((item) => item.href === pathname);
  return currentPage?.label ?? fallback;
}
