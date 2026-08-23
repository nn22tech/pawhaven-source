import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// NextAuth v4 configuration.
//
// SESSION POLICY:
//   • 30-minute inactivity timeout — the JWT expires after 30 min.
//   • Cookie uses NextAuth defaults (well-tested across all browsers).
//   • Sliding refresh every 5 min (updateAge) — balances security with
//     stability. updateAge: 0 caused token races on Vercel serverless.
//
// CUSTOM DOMAIN:
//   Set NEXTAUTH_URL to your custom domain in Vercel env vars.
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
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    // 30-minute session lifetime
    maxAge: 30 * 60,
    // Refresh token every 5 minutes (not on every request — that caused
    // race conditions on Vercel serverless)
    updateAge: 5 * 60,
  },
  secret:
    process.env.NEXTAUTH_SECRET || "pawhaven-dev-secret-change-in-production",
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
