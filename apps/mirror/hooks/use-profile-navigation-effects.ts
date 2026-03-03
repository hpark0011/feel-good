"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/**
 * Detects article detail routes: `/@username/slug` where slug is not "chat".
 * Used to save/restore scroll position during article list ↔ detail navigation.
 */
const isArticleDetailRoute = (path: string) =>
  /^\/@[^/]+\/(?!chat(?:\/|$)).+/.test(path);

export function useProfileNavigationEffects(
  scrollContainer: HTMLElement | null,
) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const savedScrollTop = useRef(0);

  useLayoutEffect(() => {
    if (pathname === prevPathname.current) return;

    const wasDetail = isArticleDetailRoute(prevPathname.current);
    const isDetail = isArticleDetailRoute(pathname);
    prevPathname.current = pathname;

    if (!scrollContainer) return;

    if (isDetail && !wasDetail) {
      // Forward: save scroll position and scroll to top
      savedScrollTop.current = scrollContainer.scrollTop;
      scrollContainer.scrollTo(0, 0);
    } else if (!isDetail && wasDetail) {
      // Back: restore saved scroll position
      scrollContainer.scrollTo(0, savedScrollTop.current);
    }
  }, [pathname, scrollContainer]);
}
