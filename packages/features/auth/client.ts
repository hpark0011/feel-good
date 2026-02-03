"use client";

import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { magicLinkClient } from "better-auth/client/plugins";

/**
 * Creates an application-specific auth client with Better Auth integration.
 * @param baseURL - The base URL for auth API endpoints
 * @returns Configured auth client with Convex and magic link plugins
 * @example
 * const authClient = createAppAuthClient(process.env.NEXT_PUBLIC_SITE_URL!);
 */
export function createAppAuthClient(baseURL: string) {
  return createAuthClient({
    baseURL,
    plugins: [convexClient(), magicLinkClient()],
  });
}

export type AuthClient = ReturnType<typeof createAppAuthClient>;
