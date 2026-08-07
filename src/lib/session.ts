import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export type Role = "ADMIN" | "MODERATOR";

export interface AppUser {
  id: string;
  email: string;
  name: string | null;
  role: Role;
}

/** Returns the current authenticated staff user (admin or moderator) or null. */
export async function getCurrentUser(): Promise<AppUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const role = (session.user as any).role as Role | undefined;
  if (role !== "ADMIN" && role !== "MODERATOR") return null;
  return {
    id: (session.user as any).id,
    email: session.user.email!,
    name: session.user.name ?? null,
    role,
  };
}

/** Throws-style helper: returns user or null if not at least moderator. */
export async function requireStaff(): Promise<AppUser | null> {
  return getCurrentUser();
}

/** Returns user only if they are an admin, otherwise null. */
export async function requireAdmin(): Promise<AppUser | null> {
  const u = await getCurrentUser();
  if (!u || u.role !== "ADMIN") return null;
  return u;
}
