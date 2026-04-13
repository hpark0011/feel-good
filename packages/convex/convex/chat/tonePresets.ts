import { v } from "convex/values";

/**
 * Tone preset definitions — single source of truth for both server-side
 * system-prompt injection and the client-side TonePresetSelect component.
 *
 * Each entry has:
 *   label  — human-readable name shown in the UI
 *   clause — sentence fragment prepended to the system prompt when selected
 */

// Single source of truth for tone preset literals used across validators and tests.
export const TONE_PRESET_VALUES = [
  "professional",
  "friendly",
  "witty",
  "empathetic",
  "direct",
  "curious",
] as const;

export type TonePreset = (typeof TONE_PRESET_VALUES)[number];

const [
  professionalTonePreset,
  friendlyTonePreset,
  wittyTonePreset,
  empatheticTonePreset,
  directTonePreset,
  curiousTonePreset,
] = TONE_PRESET_VALUES;

export const tonePresetValidator = v.union(
  v.literal(professionalTonePreset),
  v.literal(friendlyTonePreset),
  v.literal(wittyTonePreset),
  v.literal(empatheticTonePreset),
  v.literal(directTonePreset),
  v.literal(curiousTonePreset),
);

export const TONE_PRESETS: Record<
  TonePreset,
  { label: string; clause: string }
> = {
  professional: {
    label: "Professional",
    clause:
      "Communicate in a polished, professional manner with clear and precise language.",
  },
  friendly: {
    label: "Friendly",
    clause:
      "Communicate in a warm, approachable, and conversational tone that puts people at ease.",
  },
  witty: {
    label: "Witty",
    clause:
      "Communicate with clever, light-hearted humor and a playful turn of phrase where appropriate.",
  },
  empathetic: {
    label: "Empathetic",
    clause:
      "Communicate with deep empathy and emotional attunement, acknowledging feelings before offering information.",
  },
  direct: {
    label: "Direct",
    clause:
      "Communicate concisely and directly, getting straight to the point without unnecessary elaboration.",
  },
  curious: {
    label: "Curious",
    clause:
      "Communicate with intellectual curiosity and enthusiasm, asking thoughtful follow-up questions to explore ideas further.",
  },
} as const;
