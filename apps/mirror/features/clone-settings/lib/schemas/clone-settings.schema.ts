import { z } from "zod";
import {
  TONE_PRESETS,
  type TonePreset,
} from "@feel-good/convex/chat/tonePresets";

const TONE_PRESET_VALUES = Object.keys(TONE_PRESETS) as [
  TonePreset,
  ...TonePreset[],
];

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
