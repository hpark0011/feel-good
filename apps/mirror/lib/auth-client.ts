"use client";

import { getAuthClient, createSessionProvider } from "@feel-good/features/auth";
import { clientEnv } from "./env/client";

export const authClient = getAuthClient(
  clientEnv.NEXT_PUBLIC_SITE_URL
);

const { SessionProvider, useSession } = createSessionProvider(authClient);

export { SessionProvider, useSession };

export const { signIn, signUp, signOut } = authClient;
