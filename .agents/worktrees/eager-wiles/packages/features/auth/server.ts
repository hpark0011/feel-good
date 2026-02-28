import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

export interface AuthServerConfig {
  convexUrl: string;
  convexSiteUrl: string;
}

/**
 * Creates server-side auth utilities for Next.js with Convex integration.
 * @param config - Configuration object containing Convex URLs
 * @param config.convexUrl - The Convex deployment URL
 * @param config.convexSiteUrl - The site URL for Convex authentication
 * @returns Server utilities for handling auth in Next.js API routes
 * @example
 * const authServerUtils = createAuthServerUtils({
 *   convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
 *   convexSiteUrl: process.env.NEXT_PUBLIC_SITE_URL!,
 * });
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createAuthServerUtils(config: AuthServerConfig) {
  return convexBetterAuthNextJs({
    convexUrl: config.convexUrl,
    convexSiteUrl: config.convexSiteUrl,
  });
}

export type AuthServerUtils = ReturnType<typeof createAuthServerUtils>;
