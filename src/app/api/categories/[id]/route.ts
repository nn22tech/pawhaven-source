import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { slugify } from "@/lib/format";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const category = await db.category.update({
    where: { id },
    data: {
      name: body.name,
      slug: body.slug ? slugify(body.slug) : undefined,
      description: body.description ?? undefined,
      icon: body.icon ?? undefined,
      order: body.order !== undefined ? Number(body.order) : undefined,
    },
  });
  return NextResponse.json({ category });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
