/**
 * Tone preset definitions — single source of truth for both server-side
 * system-prompt injection and the client-side TonePresetSelect component.
 *
 * Each entry has:
 *   label  — human-readable name shown in the UI
 *   clause — sentence fragment prepended to the system prompt when selected
 */

export type TonePreset =
  | "professional"
  | "friendly"
  | "witty"
  | "empathetic"
  | "direct"
  | "curious";

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
