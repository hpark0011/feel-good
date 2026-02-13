"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { isArticleDetailRoute } from "./use-nav-direction";

export function useScrollMemory(scrollContainer: HTMLElement | null) {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);
  const savedScrollTop = useRef(0);

  useLayoutEffect(() => {
    if (!scrollContainer || pathname === prevPathname.current) return;

    const wasDetail = isArticleDetailRoute(prevPathname.current);
    const isDetail = isArticleDetailRoute(pathname);

    if (isDetail && !wasDetail) {
      // Forward: save list scroll, reset to top
      savedScrollTop.current = scrollContainer.scrollTop;
      scrollContainer.scrollTo(0, 0);
    } else if (!isDetail && wasDetail) {
      // Back: restore list scroll
      scrollContainer.scrollTo(0, savedScrollTop.current);
    }

    prevPathname.current = pathname;
  }, [pathname, scrollContainer]);
}
