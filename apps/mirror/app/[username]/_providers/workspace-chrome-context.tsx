"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type ContentPanelPhase = "open" | "closing" | "closed" | "opening";

const CONTENT_PANEL_ID = "profile-content-panel";

type WorkspaceChromeContextValue = {
  contentPanelId: string;
  contentPanelPhase: ContentPanelPhase;
  isContentPanelOpen: boolean;
  isTransitioning: boolean;
  toggleContentPanel: () => void;
  completeClosing: () => void;
  completeOpening: () => void;
};

const WorkspaceChromeContext = createContext<WorkspaceChromeContextValue | null>(
  null,
);

export function useWorkspaceChrome() {
  const ctx = useContext(WorkspaceChromeContext);
  if (!ctx) {
    throw new Error(
      "useWorkspaceChrome must be used within WorkspaceChromeProvider",
    );
  }
  return ctx;
}

type WorkspaceChromeProviderProps = {
  children: ReactNode;
};

export function WorkspaceChromeProvider({
  children,
}: WorkspaceChromeProviderProps) {
  const [contentPanelPhase, setContentPanelPhase] =
    useState<ContentPanelPhase>("open");

  const toggleContentPanel = useCallback(() => {
    setContentPanelPhase((currentPhase) => {
      if (currentPhase === "open") return "closing";
      if (currentPhase === "closed") return "opening";
      return currentPhase;
    });
  }, []);

  const completeClosing = useCallback(() => {
    setContentPanelPhase((currentPhase) => {
      return currentPhase === "closing" ? "closed" : currentPhase;
    });
  }, []);

  const completeOpening = useCallback(() => {
    setContentPanelPhase((currentPhase) => {
      return currentPhase === "opening" ? "open" : currentPhase;
    });
  }, []);

  const value = useMemo(
    () => ({
      contentPanelId: CONTENT_PANEL_ID,
      contentPanelPhase,
      isContentPanelOpen:
        contentPanelPhase === "open" || contentPanelPhase === "opening",
      isTransitioning:
        contentPanelPhase === "closing" || contentPanelPhase === "opening",
      toggleContentPanel,
      completeClosing,
      completeOpening,
    }),
    [
      contentPanelPhase,
      toggleContentPanel,
      completeClosing,
      completeOpening,
    ],
  );

  return (
    <WorkspaceChromeContext.Provider value={value}>
      {children}
    </WorkspaceChromeContext.Provider>
  );
}
