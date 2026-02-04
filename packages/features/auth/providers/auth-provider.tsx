"use client";

import { createContext, useContext, type ReactNode } from "react";
import { getAuthClient, type AuthClient } from "../client";

const AuthClientContext = createContext<AuthClient | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  baseURL?: string;
}

/**
 * Provides auth client via React context.
 * Alternative to passing authClient as a prop to every component.
 *
 * @example
 * // app/layout.tsx
 * import { AuthProvider } from "@feel-good/features/auth/providers"
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <AuthProvider>
 *       {children}
 *     </AuthProvider>
 *   )
 * }
 */
export function AuthProvider({ children, baseURL }: AuthProviderProps) {
  const client = getAuthClient(baseURL);
  return (
    <AuthClientContext.Provider value={client}>
      {children}
    </AuthClientContext.Provider>
  );
}

/**
 * Access the auth client from context.
 * Must be used within an AuthProvider.
 *
 * @throws Error if used outside of AuthProvider
 */
export function useAuthClient(): AuthClient {
  const client = useContext(AuthClientContext);
  if (!client) {
    throw new Error("useAuthClient must be used within AuthProvider");
  }
  return client;
}
