import { describe, expect, it } from "vitest";
import {
  AUTH_ERROR_MESSAGES,
  getAuthErrorMessage,
} from "../types";

const BETA_CLOSED_COPY =
  "Sign-ups are currently invite-only. Contact us if you'd like access.";

describe("getAuthErrorMessage('BETA_CLOSED')", () => {
  it("returns the exact FR-10 invite-only copy", () => {
    expect(getAuthErrorMessage("BETA_CLOSED")).toBe(BETA_CLOSED_COPY);
    // Redundant map-level assertion guards against a regression where
    // `getAuthErrorMessage` is refactored to stop reading the map.
    expect(AUTH_ERROR_MESSAGES.BETA_CLOSED).toBe(BETA_CLOSED_COPY);
  });
});
