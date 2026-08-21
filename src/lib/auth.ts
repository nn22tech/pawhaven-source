import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

// NextAuth v4 configuration with credentials provider.
//
// SESSION POLICY:
//   • 10-minute inactivity timeout — the JWT expires after 10 minutes
//     of no requests. Active users stay logged in via sliding refresh.
//   • Uses NextAuth's DEFAULT cookie settings (well-tested across all
//     browsers). Custom cookie overrides were causing login failures on
//     Chrome/Edge/Safari — only Firefox worked because it had a cached
//     session from before.
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
    // 10 minutes — the session expires after 10 min of inactivity
    maxAge: 10 * 60,
    // Refresh the token on every request (sliding window)
    updateAge: 0,
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
