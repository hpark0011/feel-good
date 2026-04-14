/**
 * Pure helper that decides what a request to /messages should do based on
 * the current auth state.
 *
 * Kept pure (no Next.js imports) so it can be unit-tested in a node
 * environment without the Next.js runtime.
 */

export type MessagesRouteAccessInput = {
  /** Authenticated user — null/undefined when signed out */
  user: { id: string } | null | undefined;
};

export type MessagesRouteAccessResult =
  | { action: "render" }
  | { action: "redirect"; destination: string };

export function resolveMessagesRouteAccess(
  input: MessagesRouteAccessInput,
): MessagesRouteAccessResult {
  if (!input.user) {
    return { action: "redirect", destination: "/sign-in" };
  }
  return { action: "render" };
}
