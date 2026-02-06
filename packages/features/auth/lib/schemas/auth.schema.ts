import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name is too long");

export const MagicLinkSchema = z.object({
  email: emailSchema,
});

export type MagicLinkData = z.infer<typeof MagicLinkSchema>;

export const otpSchema = z.object({
  email: emailSchema,
  otp: z.string().length(6, "Enter all 6 digits"),
});

export type OTPSchema = z.infer<typeof otpSchema>;
export type OTPData = z.infer<typeof otpSchema>;
