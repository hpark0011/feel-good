import { describe, expect, it } from "bun:test";
import { TONE_PRESETS, type TonePreset } from "../tonePresets";
import { composeSystemPrompt } from "../helpers";

const DEFAULT_PERSONA =
  "Answer questions helpfully based on your profile information and published articles.";

// UT-02: composes in exact order with \n\n joins when all fields provided
describe("composeSystemPrompt (mirrors loadStreamingContext logic)", () => {
  it("UT-02: composes all segments in correct order joined by \\n\\n", () => {
    const result = composeSystemPrompt({
      name: "Alice",
      bio: "A writer",
      personaPrompt: "My custom persona",
      tonePreset: "friendly",
      topicsToAvoid: "politics",
    });

    const segments = result.split("\n\n");

    // Segment 0: SAFETY_PREFIX
    expect(segments[0]).toContain("digital clone of Alice");

    // Segment 1: tone clause (friendly)
    expect(segments[1]).toBe(TONE_PRESETS.friendly.clause);

    // Segment 2: bio
    expect(segments[2]).toBe("Bio: A writer");

    // Segment 3: persona
    expect(segments[3]).toBe("My custom persona");

    // Segment 4: topics
    expect(segments[4]).toBe("Avoid discussing: politics");

    expect(segments).toHaveLength(5);
  });

  // UT-03: omits tone clause when tonePreset is null
  it("UT-03: omits tone clause when tonePreset is null", () => {
    const result = composeSystemPrompt({
      name: "Bob",
      bio: "A developer",
      personaPrompt: "My persona",
      tonePreset: null,
      topicsToAvoid: null,
    });

    // Should contain no clause from TONE_PRESETS
    for (const key of Object.keys(TONE_PRESETS) as TonePreset[]) {
      expect(result).not.toContain(TONE_PRESETS[key].clause);
    }

    const segments = result.split("\n\n");
    // SAFETY_PREFIX, bio, persona — no tone, no topics
    expect(segments).toHaveLength(3);
  });

  // UT-04: omits topics line when topicsToAvoid is null
  it("UT-04: omits topics line when topicsToAvoid is null", () => {
    const result = composeSystemPrompt({
      name: "Carol",
      bio: "An artist",
      personaPrompt: "Creative persona",
      tonePreset: "witty",
      topicsToAvoid: null,
    });

    expect(result).not.toContain("Avoid discussing:");
  });

  // UT-05: falls back to DEFAULT_PERSONA when personaPrompt is null
  it("UT-05: falls back to DEFAULT_PERSONA when personaPrompt is null", () => {
    const resultNull = composeSystemPrompt({
      name: "Dave",
      personaPrompt: null,
    });
    expect(resultNull).toContain(DEFAULT_PERSONA);
  });

  it("UT-05: falls back to DEFAULT_PERSONA when personaPrompt is empty string", () => {
    const resultEmpty = composeSystemPrompt({
      name: "Dave",
      personaPrompt: "",
    });
    expect(resultEmpty).toContain(DEFAULT_PERSONA);
  });
});
