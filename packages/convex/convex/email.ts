"use node";

import { Resend } from "@convex-dev/resend";
import { components } from "./_generated/api";
import { action } from "./_generated/server";
import { v } from "convex/values";

const resend = new Resend(components.resend);

// Configurable email sender settings via environment variables
// Using || instead of ?? to also handle empty strings as falsy
const APP_NAME = process.env.APP_NAME || "Mirror";
const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN || "mirror.app";
const EMAIL_FROM = `${APP_NAME} <auth@${EMAIL_DOMAIN}>`;

interface EmailTemplateConfig {
  title: string;
  message: string;
  buttonText: string;
  link: string;
  footerText: string;
}

function createEmailTemplate(config: EmailTemplateConfig): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; background: #f9fafb;">
      <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
        <h1 style="margin: 0 0 24px; font-size: 24px; font-weight: 600; color: #111827;">${config.title}</h1>
        <p style="margin: 0 0 24px; color: #6b7280; line-height: 1.6;">${config.message}</p>
        <a href="${config.link}" style="display: inline-block; padding: 12px 24px; background: #111827; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">${config.buttonText}</a>
        <p style="margin: 24px 0 0; font-size: 14px; color: #9ca3af;">${config.footerText}</p>
      </div>
    </body>
    </html>
  `;
}

export const sendMagicLink = action({
  args: {
    to: v.string(),
    link: v.string(),
  },
  handler: async (ctx, { to, link }) => {
    await resend.sendEmail(ctx, {
      from: EMAIL_FROM,
      to,
      subject: `Sign in to ${APP_NAME}`,
      html: createEmailTemplate({
        title: `Sign in to ${APP_NAME}`,
        message:
          "Click the button below to sign in to your account. This link will expire in 15 minutes.",
        buttonText: "Sign In",
        link,
        footerText:
          "If you didn't request this email, you can safely ignore it.",
      }),
    });
  },
});

export const sendVerificationEmail = action({
  args: {
    to: v.string(),
    link: v.string(),
  },
  handler: async (ctx, { to, link }) => {
    await resend.sendEmail(ctx, {
      from: EMAIL_FROM,
      to,
      subject: `Verify your ${APP_NAME} email address`,
      html: createEmailTemplate({
        title: "Verify your email",
        message:
          "Thanks for signing up! Please verify your email address by clicking the button below.",
        buttonText: "Verify Email",
        link,
        footerText:
          "If you didn't create an account, you can safely ignore this email.",
      }),
    });
  },
});

export const sendPasswordReset = action({
  args: {
    to: v.string(),
    link: v.string(),
  },
  handler: async (ctx, { to, link }) => {
    await resend.sendEmail(ctx, {
      from: EMAIL_FROM,
      to,
      subject: `Reset your ${APP_NAME} password`,
      html: createEmailTemplate({
        title: "Reset your password",
        message:
          "Click the button below to reset your password. This link will expire in 1 hour.",
        buttonText: "Reset Password",
        link,
        footerText:
          "If you didn't request a password reset, you can safely ignore this email.",
      }),
    });
  },
});
