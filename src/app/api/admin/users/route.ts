import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import bcrypt from "bcryptjs";

/** GET — admin only: list all staff users */
export async function GET() {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
  });
  return NextResponse.json({ users });
}

/** POST — admin only: create a new admin or moderator */
export async function POST(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (!body.email || !body.password || body.password.length < 8) {
    return NextResponse.json({ error: "Email and password (min 8 chars) required" }, { status: 400 });
  }
  if (body.role !== "ADMIN" && body.role !== "MODERATOR") {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  const exists = await db.user.findUnique({ where: { email: body.email.trim().toLowerCase() } });
  if (exists) return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  const hash = await bcrypt.hash(body.password, 12);
  const created = await db.user.create({
    data: {
      email: body.email.trim().toLowerCase(),
      password: hash,
      name: body.name || null,
      role: body.role,
      active: body.active !== false,
    },
    select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
  });
  return NextResponse.json({ user: created });
}
