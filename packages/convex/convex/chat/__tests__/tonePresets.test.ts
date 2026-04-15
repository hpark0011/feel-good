import { describe, expect, it } from "vitest";
import { TONE_PRESETS, type TonePreset } from "../tonePresets";

const EXPECTED_KEYS: TonePreset[] = [
  "professional",
  "friendly",
  "witty",
  "empathetic",
  "direct",
  "curious",
];

// UT-01: TONE_PRESETS has exactly six keys matching the schema literal union
describe("TONE_PRESETS", () => {
  it("has exactly six keys", () => {
    expect(Object.keys(TONE_PRESETS)).toHaveLength(6);
  });

  it("contains all required preset keys", () => {
    for (const key of EXPECTED_KEYS) {
      expect(TONE_PRESETS).toHaveProperty(key);
    }
  });

  it("each preset has a non-empty label and clause", () => {
    for (const key of EXPECTED_KEYS) {
      const preset = TONE_PRESETS[key];
      expect(typeof preset.label).toBe("string");
      expect(preset.label.length).toBeGreaterThan(0);
      expect(typeof preset.clause).toBe("string");
      expect(preset.clause.length).toBeGreaterThan(0);
    }
  });

  it("has no unexpected keys beyond the six defined literals", () => {
    const actualKeys = Object.keys(TONE_PRESETS).sort();
    const expectedKeys = [...EXPECTED_KEYS].sort();
    expect(actualKeys).toEqual(expectedKeys);
  });
});
