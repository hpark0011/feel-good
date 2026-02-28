import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "greyboard-theme";

function getSnapshot(): "light" | "dark" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot(): "light" | "dark" {
  return "light";
}

function subscribe(callback: () => void): () => void {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((value: "light" | "dark") => {
    document.documentElement.classList.toggle("dark", value === "dark");
    localStorage.setItem(STORAGE_KEY, value);
  }, []);

  return { theme, setTheme } as const;
}

/** Call once at app startup to apply the persisted preference. */
export function initTheme() {
  const stored = localStorage.getItem(STORAGE_KEY) as
    | "light"
    | "dark"
    | null;
  const preferred =
    stored ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.classList.toggle("dark", preferred === "dark");
}
