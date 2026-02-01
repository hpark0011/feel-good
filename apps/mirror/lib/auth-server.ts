import { createAuthServerUtils } from "@feel-good/features/auth/server";
import { clientEnv } from "./env/client";

export const { handler, isAuthenticated, getToken, preloadAuthQuery, fetchAuthQuery } =
  createAuthServerUtils({
    convexUrl: clientEnv.NEXT_PUBLIC_CONVEX_URL,
    convexSiteUrl: clientEnv.NEXT_PUBLIC_CONVEX_SITE_URL,
  });
