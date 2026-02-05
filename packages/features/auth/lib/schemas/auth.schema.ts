import { z } from "zod";
import { PASSWORD_MIN_LENGTH } from "../../types";

export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

export const passwordSchema = z
  .string()
  .min(
    PASSWORD_MIN_LENGTH,
    `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
  );

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name is too long");

export const PasswordLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const MagicLinkSchema = z.object({
  email: emailSchema,
});

export const PasswordSignUpSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const ForgotPasswordSchema = z.object({
  email: emailSchema,
});

export const ResetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type PasswordLoginData = z.infer<typeof PasswordLoginSchema>;
export type MagicLinkData = z.infer<typeof MagicLinkSchema>;
export type PasswordSignUpData = z.infer<typeof PasswordSignUpSchema>;
export type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordData = z.infer<typeof ResetPasswordSchema>;
