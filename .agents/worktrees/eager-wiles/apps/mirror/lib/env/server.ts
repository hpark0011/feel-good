import "server-only";

import { z } from "zod";

/**
 * Server-side environment variable validation.
 * These variables are only available on the server and are
 * validated once at import time.
 */

const serverEnvSchema = z.object({
  TAVUS_API_KEY: z.string().min(1, "TAVUS_API_KEY is required"),
  TAVUS_PERSONA_ID: z.string().min(1).default("p2679f6eae3f"),
});

function validateServerEnv() {
  const result = serverEnvSchema.safeParse({
    TAVUS_API_KEY: process.env.TAVUS_API_KEY,
    TAVUS_PERSONA_ID: process.env.TAVUS_PERSONA_ID,
  });

  if (!result.success) {
    const errors = result.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `Missing or invalid server environment variables:\n${errors}\n\n` +
        `Set these in your .env.local file:\n` +
        `  TAVUS_API_KEY="your-tavus-api-key"`,
    );
  }

  return result.data;
}

export const serverEnv = validateServerEnv();

export type ServerEnv = z.infer<typeof serverEnvSchema>;
