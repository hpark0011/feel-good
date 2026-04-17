import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 1024;

function subscribe(onStoreChange: () => void) {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
  mql.addEventListener("change", onStoreChange);
  return () => mql.removeEventListener("change", onStoreChange);
}

function getSnapshot() {
  return window.innerWidth < MOBILE_BREAKPOINT;
}

function getServerSnapshot() {
  return false;
}

/**
 * Detects if viewport is below mobile breakpoint (1024px).
 * SSR-safe via useSyncExternalStore; returns false on the server.
 * @returns true if viewport width < 1024px, false otherwise
 * @example
 * const isMobile = useIsMobile();
 * if (isMobile) {
 *   // render mobile layout
 * }
 */
export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
