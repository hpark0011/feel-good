import { ConvexReactClient } from "@feel-good/convex";

import { clientEnv } from "@/lib/env/client";

let convexClient: ConvexReactClient | null = null;

/**
 * Get the Convex client singleton.
 * Uses lazy initialization to avoid module-level side effects.
 *
 * @client-only This function must only be called in client components.
 * @throws {Error} If called on the server side
 */
export function getConvexClient(): ConvexReactClient {
  if (typeof window === "undefined") {
    throw new Error(
      "getConvexClient() must only be called on the client. " +
        "Use this in a client component or wrap the call in a useEffect hook."
    );
  }

  if (convexClient) {
    return convexClient;
  }

  convexClient = new ConvexReactClient(clientEnv.NEXT_PUBLIC_CONVEX_URL);
  return convexClient;
}
