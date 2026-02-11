"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function useNavDirection() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  useLayoutEffect(() => {
    if (pathname === prevPathname.current) return;
    const isForward = pathname.startsWith("/dashboard/articles/");
    document.documentElement.dataset.navDirection = isForward
      ? "forward"
      : "back";
    prevPathname.current = pathname;
  }, [pathname]);
}
