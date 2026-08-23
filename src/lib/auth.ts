import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// NextAuth v4 configuration with credentials provider.
//
// SESSION POLICY:
//   • 10-minute inactivity timeout (sliding window) — the JWT is refreshed
//     on every request (updateAge: 0), so active users stay logged in,
//     but 10 minutes of no requests invalidates the session.
//   • Session cookie has NO maxAge → the browser deletes it when the
//     browser is closed, requiring a fresh login on next visit.
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = credentials.email.trim().toLowerCase();
        const user = await db.user.findUnique({ where: { email } });
        if (!user || !user.active) return null;
        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        } as any;
      },
    }),
  ],
  session: {
    strategy: "jwt",
    // 10 minutes absolute max age for the JWT
    maxAge: 10 * 60,
    // Update (re-issue) the token on EVERY request → sliding window.
    // A user who is active never sees the login page; a user who is
    // inactive for 10+ minutes is automatically logged out.
    updateAge: 0,
  },
  // Session cookie is a "session cookie" (no maxAge) so the browser
  // deletes it on close. This means closing the browser always requires
  // a fresh login, even if the JWT hasn't expired yet.
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        // secure is true in production (HTTPS), false in dev (HTTP)
        secure: process.env.NODE_ENV === "production",
        // NOTE: intentionally NO `maxAge` → session cookie, deleted on browser close
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "pawhaven-dev-secret-change-in-production",
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
};
