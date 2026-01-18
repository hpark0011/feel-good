"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { getStorageKey } from "@/lib/storage-keys";

export type LayoutPreference = "board" | "list";

/**
 * Manages task board/list layout mode combining viewport detection and user preference.
 * On mobile, always uses list layout. On desktop, respects user preference.
 * @returns Layout state and setters
 * @example
 * const { isListLayout, layoutPref, setLayoutPref, isMobile } = useTaskLayoutMode();
 * if (isListLayout) {
 *   // render collapsible column layout
 * }
 */
export function useTaskLayoutMode() {
  const isMobile = useIsMobile();
  const [layoutPref, setLayoutPref] = useLocalStorage<LayoutPreference>(
    getStorageKey("UI", "LAYOUT_PREFERENCE"),
    "board"
  );

  // Mobile always forces list layout, desktop respects preference
  const isListLayout = isMobile || layoutPref === "list";

  return {
    isListLayout,
    layoutPref,
    setLayoutPref,
    isMobile,
  };
}
