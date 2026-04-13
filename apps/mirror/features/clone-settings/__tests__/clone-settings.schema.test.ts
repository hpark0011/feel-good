import { describe, expect, it } from "vitest";
import {
  TONE_PRESETS,
  type TonePreset,
} from "@feel-good/convex/chat/tonePresets";
import { cloneSettingsSchema } from "../lib/schemas/clone-settings.schema";

// UT-19: Zod schema validations
describe("cloneSettingsSchema", () => {
  describe("personaPrompt", () => {
    it("accepts exactly 4000 characters", () => {
      const result = cloneSettingsSchema.safeParse({
        personaPrompt: "a".repeat(4000),
        topicsToAvoid: null,
        tonePreset: null,
      });
      expect(result.success).toBe(true);
    });

    it("rejects 4001 characters", () => {
      const result = cloneSettingsSchema.safeParse({
        personaPrompt: "a".repeat(4001),
        topicsToAvoid: null,
        tonePreset: null,
      });
      expect(result.success).toBe(false);
    });

    it("accepts null", () => {
      const result = cloneSettingsSchema.safeParse({
        personaPrompt: null,
        topicsToAvoid: null,
        tonePreset: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("topicsToAvoid", () => {
    it("accepts exactly 500 characters", () => {
      const result = cloneSettingsSchema.safeParse({
        personaPrompt: null,
        topicsToAvoid: "a".repeat(500),
        tonePreset: null,
      });
      expect(result.success).toBe(true);
    });

    it("rejects 501 characters", () => {
      const result = cloneSettingsSchema.safeParse({
        personaPrompt: null,
        topicsToAvoid: "a".repeat(501),
        tonePreset: null,
      });
      expect(result.success).toBe(false);
    });

    it("accepts null", () => {
      const result = cloneSettingsSchema.safeParse({
        personaPrompt: null,
        topicsToAvoid: null,
        tonePreset: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("tonePreset", () => {
    it("accepts all six valid presets", () => {
      const validPresets = Object.keys(TONE_PRESETS) as TonePreset[];
      for (const preset of validPresets) {
        const result = cloneSettingsSchema.safeParse({
          personaPrompt: null,
          topicsToAvoid: null,
          tonePreset: preset,
        });
        expect(result.success).toBe(true);
      }
    });

    it("rejects unknown tone preset", () => {
      const result = cloneSettingsSchema.safeParse({
        personaPrompt: null,
        topicsToAvoid: null,
        tonePreset: "aggressive",
      });
      expect(result.success).toBe(false);
    });

    it("accepts null", () => {
      const result = cloneSettingsSchema.safeParse({
        personaPrompt: null,
        topicsToAvoid: null,
        tonePreset: null,
      });
      expect(result.success).toBe(true);
    });
  });
});
