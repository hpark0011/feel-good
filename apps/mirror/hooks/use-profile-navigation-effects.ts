"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { isArticleDetailRoute } from "./use-pathname-transition";

type ScrollContainers = {
  mobile: HTMLElement | null;
  desktop: HTMLElement | null;
};

export function useProfileNavigationEffects(containers: ScrollContainers) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const savedScrollTop = useRef(0);
  const activeContainer = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    // Pick whichever container is currently mounted (mobile or desktop).
    activeContainer.current = containers.mobile ?? containers.desktop;
  }, [containers.mobile, containers.desktop]);

  useLayoutEffect(() => {
    if (pathname === prevPathname.current) return;

    const wasDetail = isArticleDetailRoute(prevPathname.current);
    const isDetail = isArticleDetailRoute(pathname);
    prevPathname.current = pathname;

    const scrollContainer = activeContainer.current;
    if (!scrollContainer) return;

    if (isDetail && !wasDetail) {
      // Forward: save scroll position and scroll to top
      savedScrollTop.current = scrollContainer.scrollTop;
      scrollContainer.scrollTo(0, 0);
    } else if (!isDetail && wasDetail) {
      // Back: restore saved scroll position
      scrollContainer.scrollTo(0, savedScrollTop.current);
    }
  }, [pathname]);
}
