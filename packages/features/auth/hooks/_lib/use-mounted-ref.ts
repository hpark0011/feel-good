"use client";

import { useRef, useEffect } from "react";

/**
 * Returns a ref that tracks whether the component is mounted.
 * Useful for preventing state updates on unmounted components
 * after async operations complete.
 */
export function useMountedRef() {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return isMountedRef;
}
