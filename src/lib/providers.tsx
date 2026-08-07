"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * App-wide providers.
 *
 * NOTE: We intentionally do NOT wrap the app in next-auth's `SessionProvider`.
 * The storefront is fully public and never calls `useSession()`. The only
 * client-side auth helpers used are `signIn` / `signOut`, which are standalone
 * fetch wrappers and do not require the session context. Wrapping the whole
 * app in `SessionProvider` caused a React `useId` hydration mismatch on
 * Radix UI components (the provider kicks off a client-side session fetch
 * that shifts the `useId` generation order vs. the server render).
 *
 * The hidden panels use `getServerSession` (server-side) so they don't need
 * the client provider either.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
