import { describe, expect, it } from "bun:test";
import type { TonePreset } from "../../chat/tonePresets";

/**
 * Pure re-implementation of the validation + patch-building logic from
 * updatePersonaSettings, isolated from the Convex runtime.
 */
interface PersonaArgs {
  personaPrompt?: string | null;
  tonePreset?: TonePreset | null;
  topicsToAvoid?: string | null;
}

function buildPersonaPatch(args: PersonaArgs): Record<string, unknown> {
  // Length guards — checked BEFORE any DB write
  if (typeof args.personaPrompt === "string" && args.personaPrompt.length > 4000) {
    throw new Error("personaPrompt exceeds 4000 characters");
  }
  if (typeof args.topicsToAvoid === "string" && args.topicsToAvoid.length > 500) {
    throw new Error("topicsToAvoid exceeds 500 characters");
  }

  const patch: Record<string, unknown> = {};
  if (args.personaPrompt !== undefined) patch.personaPrompt = args.personaPrompt;
  if (args.tonePreset !== undefined) patch.tonePreset = args.tonePreset;
  if (args.topicsToAvoid !== undefined) patch.topicsToAvoid = args.topicsToAvoid;
  return patch;
}

// UT-06: throws on personaPrompt > 4000 chars before patch
describe("updatePersonaSettings validation logic", () => {
  it("UT-06: throws when personaPrompt exceeds 4000 characters", () => {
    const longPrompt = "a".repeat(4001);
    expect(() => buildPersonaPatch({ personaPrompt: longPrompt })).toThrow(
      "personaPrompt exceeds 4000 characters",
    );
  });

  // UT-07: throws on topicsToAvoid > 500 chars before patch
  it("UT-07: throws when topicsToAvoid exceeds 500 characters", () => {
    const longTopics = "b".repeat(501);
    expect(() => buildPersonaPatch({ topicsToAvoid: longTopics })).toThrow(
      "topicsToAvoid exceeds 500 characters",
    );
  });

  // UT-08: succeeds at exact boundary lengths (4000 / 500)
  it("UT-08: succeeds with personaPrompt at exactly 4000 characters", () => {
    const exactPrompt = "c".repeat(4000);
    expect(() => buildPersonaPatch({ personaPrompt: exactPrompt })).not.toThrow();
    const patch = buildPersonaPatch({ personaPrompt: exactPrompt });
    expect(patch.personaPrompt).toBe(exactPrompt);
  });

  it("UT-08: succeeds with topicsToAvoid at exactly 500 characters", () => {
    const exactTopics = "d".repeat(500);
    expect(() => buildPersonaPatch({ topicsToAvoid: exactTopics })).not.toThrow();
    const patch = buildPersonaPatch({ topicsToAvoid: exactTopics });
    expect(patch.topicsToAvoid).toBe(exactTopics);
  });

  // UT-09: passing null clears the field; passing undefined leaves it out of patch
  it("UT-09: null clears the field (included in patch as null)", () => {
    const patch = buildPersonaPatch({
      personaPrompt: null,
      tonePreset: null,
      topicsToAvoid: null,
    });
    expect(patch).toHaveProperty("personaPrompt", null);
    expect(patch).toHaveProperty("tonePreset", null);
    expect(patch).toHaveProperty("topicsToAvoid", null);
  });

  it("UT-09: undefined leaves the key absent from patch (Convex drop behavior)", () => {
    const patch = buildPersonaPatch({
      personaPrompt: undefined,
      tonePreset: undefined,
      topicsToAvoid: undefined,
    });
    expect(patch).not.toHaveProperty("personaPrompt");
    expect(patch).not.toHaveProperty("tonePreset");
    expect(patch).not.toHaveProperty("topicsToAvoid");
  });

  it("UT-09: mixed — null clears one field, undefined omits another", () => {
    const patch = buildPersonaPatch({
      personaPrompt: null,
      tonePreset: "witty",
      topicsToAvoid: undefined,
    });
    expect(patch).toHaveProperty("personaPrompt", null);
    expect(patch).toHaveProperty("tonePreset", "witty");
    expect(patch).not.toHaveProperty("topicsToAvoid");
  });

  it("guard throws before patch is built (personaPrompt check is first)", () => {
    const longPrompt = "x".repeat(4001);
    // Should throw immediately, no patch returned
    let threw = false;
    try {
      buildPersonaPatch({ personaPrompt: longPrompt });
    } catch {
      threw = true;
    }
    expect(threw).toBe(true);
  });
});
