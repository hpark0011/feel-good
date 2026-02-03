// Auth action hooks
export {
  usePasswordSignIn,
  type UsePasswordSignInOptions,
  type UsePasswordSignInReturn,
} from "./use-password-sign-in";
export {
  usePasswordSignUp,
  type UsePasswordSignUpOptions,
  type UsePasswordSignUpReturn,
} from "./use-password-sign-up";
export {
  useMagicLinkRequest,
  type UseMagicLinkRequestOptions,
  type UseMagicLinkRequestReturn,
} from "./use-magic-link-request";
export {
  useForgotPassword,
  type UseForgotPasswordOptions,
  type UseForgotPasswordReturn,
} from "./use-forgot-password";
export {
  useResetPassword,
  type UseResetPasswordOptions,
  type UseResetPasswordReturn,
} from "./use-reset-password";

// Context hook
export { useAuthClient } from "../providers";

// Session hook
export { createUseSession } from "./use-session";
