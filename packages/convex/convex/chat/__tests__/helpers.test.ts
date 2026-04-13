import { describe, expect, it } from "bun:test";
import { TONE_PRESETS, type TonePreset } from "../tonePresets";

/**
 * Pure re-implementation of the system-prompt composition logic from
 * loadStreamingContext, isolated from Convex runtime for unit testing.
 *
 * This function mirrors the exact logic in helpers.ts so that any drift
 * between the two is caught at review time.
 */
const SAFETY_PREFIX = (name: string) =>
  `You are a digital clone of ${name}. You represent their ideas and perspectives based on their writing and profile.
You must never: claim to be human, share private information not in your context, make commitments on behalf of the real person, or provide medical/legal/financial advice.`;

const DEFAULT_PERSONA =
  "Answer questions helpfully based on your profile information and published articles.";

function composeSystemPrompt(opts: {
  name?: string | null;
  bio?: string | null;
  personaPrompt?: string | null;
  tonePreset?: TonePreset | null;
  topicsToAvoid?: string | null;
}): string {
  const name = opts.name || "this person";
  const parts: string[] = [SAFETY_PREFIX(name)];

  // 2. Tone clause — omit when tonePreset is null/undefined
  if (opts.tonePreset && opts.tonePreset in TONE_PRESETS) {
    parts.push(TONE_PRESETS[opts.tonePreset].clause);
  }

  // 3. Bio — omit when falsy
  if (opts.bio) {
    parts.push(`Bio: ${opts.bio}`);
  }

  // 4. Persona — fall back to DEFAULT_PERSONA when null or empty string
  parts.push(opts.personaPrompt || DEFAULT_PERSONA);

  // 5. Topics to avoid — omit when null
  if (opts.topicsToAvoid) {
    parts.push(`Avoid discussing: ${opts.topicsToAvoid}`);
  }

  return parts.join("\n\n");
}

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
