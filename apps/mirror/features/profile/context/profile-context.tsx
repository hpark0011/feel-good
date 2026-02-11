"use client";

import { createContext, useContext } from "react";
import type { Profile } from "../lib/mock-profile";

type ProfileContextValue = {
  profile: Profile;
  isOwner: boolean;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export const ProfileProvider = ProfileContext.Provider;

export function useProfileContext() {
  const ctx = useContext(ProfileContext);
  if (!ctx)
    throw new Error("useProfileContext must be used within ProfileProvider");
  return ctx;
}

export function useIsProfileOwner() {
  return useProfileContext().isOwner;
}
