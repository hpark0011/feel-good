import { describe, expect, it } from "vitest";
import {
  PROFILE_TAB_DEFAULT_KIND,
  PROFILE_TAB_KINDS,
  isProfileTabKind,
} from "../types";

// UT-17: isProfileTabKind returns true for all three kinds; false for unknowns
describe("isProfileTabKind", () => {
  it("uses the first profile tab as the default kind", () => {
    expect(PROFILE_TAB_DEFAULT_KIND).toBe(PROFILE_TAB_KINDS[0]);
    expect(isProfileTabKind(PROFILE_TAB_DEFAULT_KIND)).toBe(true);
  });

  it("returns true for all three defined kinds", () => {
    for (const kind of PROFILE_TAB_KINDS) {
      expect(isProfileTabKind(kind)).toBe(true);
    }
  });

  it("returns true specifically for posts, articles, clone-settings", () => {
    expect(isProfileTabKind("posts")).toBe(true);
    expect(isProfileTabKind("articles")).toBe(true);
    expect(isProfileTabKind("clone-settings")).toBe(true);
  });

  it("returns false for unknown strings", () => {
    expect(isProfileTabKind("unknown")).toBe(false);
    expect(isProfileTabKind("settings")).toBe(false);
    expect(isProfileTabKind("dashboard")).toBe(false);
    expect(isProfileTabKind("")).toBe(false);
  });

  it("returns false for null and undefined", () => {
    expect(isProfileTabKind(null)).toBe(false);
    expect(isProfileTabKind(undefined)).toBe(false);
  });
});
