/**
 * Messages route access tests — FR-01
 *
 * Exercises the pure resolveMessagesRouteAccess helper that determines whether
 * a /messages request should render the inbox or redirect to /sign-in.
 */
import { describe, it, expect } from "vitest";
import { resolveMessagesRouteAccess } from "../resolve-messages-route-access";

describe("resolveMessagesRouteAccess", () => {
  it("returns redirect metadata for signed-out /messages access", () => {
    const result = resolveMessagesRouteAccess({ user: null });
    expect(result.action).toBe("redirect");
    if (result.action !== "redirect") return;
    expect(result.destination).toBe("/sign-in");
  });

  it("returns redirect when user is undefined (no session)", () => {
    const result = resolveMessagesRouteAccess({ user: undefined });
    expect(result.action).toBe("redirect");
    if (result.action !== "redirect") return;
    expect(result.destination).toBe("/sign-in");
  });

  it("returns render action for an authenticated user", () => {
    const result = resolveMessagesRouteAccess({ user: { id: "user_abc" } });
    expect(result.action).toBe("render");
  });

  it("redirect destination is /sign-in (not /login or another path)", () => {
    const result = resolveMessagesRouteAccess({ user: null });
    if (result.action !== "redirect") return;
    expect(result.destination).toBe("/sign-in");
  });
});
