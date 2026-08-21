import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Server-side redirect after login.
 * NextAuth redirects here after successful authentication (callbackUrl).
 * We read the session SERVER-SIDE (no client timing issues) and redirect
 * to the correct panel based on the user's role.
 */
export const dynamic = "force-dynamic";

export default async function AuthCallback() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?error=SessionNotFound");
  }

  const role = (session.user as any).role;
  redirect(role === "ADMIN" ? "/admin" : "/moderator");
}
