// =============================================================================
// COMPATIBILITY LAYER
// These exports maintain backwards compatibility with existing consumers.
// For new code, prefer importing from specific subpaths:
//   - @feel-good/features/auth/blocks (drop-in page sections)
//   - @feel-good/features/auth/components/forms (composable forms)
//   - @feel-good/features/auth/components/views (pure UI)
//   - @feel-good/features/auth/hooks (headless logic)
// =============================================================================

// Legacy form exports (map to new form components)
export { SignInForm } from "./sign-in-form";
export { SignUpForm } from "./sign-up-form";
export { MagicLinkForm } from "./magic-link-form";
export { OAuthButtons } from "./oauth-buttons";
export { ForgotPasswordForm } from "./forgot-password-form";
export { ResetPasswordForm } from "./reset-password-form";

// Session provider
export { createSessionProvider } from "./session-provider";

// Shared components (legacy)
export { FormError } from "./form-error";
export { FormSuccess } from "./form-success";

// =============================================================================
// NEW EXPORTS (organized by layer)
// =============================================================================

// Forms layer
export * from "./forms";

// Views layer
export * from "./views";

// Shared components
export * from "./shared";
