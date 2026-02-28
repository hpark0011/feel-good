"use client";

import { usePathname } from "next/navigation";
import {
  BLOCK_NAV_ITEMS,
  COMPONENT_NAV_ITEMS,
} from "@/config/navigation.config";

export function usePageTitle(fallback = "Page"): string {
  const pathname = usePathname();
  const allItems = [...COMPONENT_NAV_ITEMS, ...BLOCK_NAV_ITEMS];
  const currentPage = allItems.find((item) => item.href === pathname);
  return currentPage?.label ?? fallback;
}
