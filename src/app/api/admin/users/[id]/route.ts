import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import bcrypt from "bcryptjs";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await requireAdmin();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  // Prevent admin from locking themselves out / demoting themselves
  if (id === me.id && (body.active === false || body.role === "MODERATOR")) {
    return NextResponse.json({ error: "You cannot deactivate or demote yourself" }, { status: 400 });
  }

  const data: any = {};
  if (body.name !== undefined) data.name = body.name || null;
  if (body.role !== undefined) data.role = body.role;
  if (body.active !== undefined) data.active = Boolean(body.active);
  if (body.email !== undefined) data.email = String(body.email).trim().toLowerCase();
  if (body.password) {
    if (body.password.length < 8) {
      return NextResponse.json({ error: "Password min 8 chars" }, { status: 400 });
    }
    data.password = await bcrypt.hash(body.password, 12);
  }
  const updated = await db.user.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
  });
  return NextResponse.json({ user: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await requireAdmin();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  if (id === me.id) {
    return NextResponse.json({ error: "You cannot delete yourself" }, { status: 400 });
  }
  await db.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
