import { z } from "zod";

export const TONE_PRESET_VALUES = [
  "professional",
  "friendly",
  "witty",
  "empathetic",
  "direct",
  "curious",
] as const;

export const cloneSettingsSchema = z.object({
  personaPrompt: z
    .string()
    .max(4000, "Persona prompt must be 4000 characters or fewer")
    .nullable(),
  topicsToAvoid: z
    .string()
    .max(500, "Topics to avoid must be 500 characters or fewer")
    .nullable(),
  tonePreset: z.enum(TONE_PRESET_VALUES).nullable(),
});

export type CloneSettingsFormValues = z.infer<typeof cloneSettingsSchema>;
