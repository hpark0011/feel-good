"use client";

import { createContext, useContext } from "react";

// Default null = use document viewport as scroll root (IntersectionObserver default).
// On mobile, ScrollRootProvider supplies the drawer's scroll container.
const ScrollRootContext = createContext<HTMLElement | null>(null);

export const ScrollRootProvider = ScrollRootContext.Provider;

export function useScrollRoot() {
  return useContext(ScrollRootContext);
}
