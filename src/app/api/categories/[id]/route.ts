import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { slugify } from "@/lib/format";
import { bustCategoriesCache, bustProductsCache } from "@/lib/cache";
import { revalidatePath } from "next/cache";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  try {
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
    bustCategoriesCache();
    revalidatePath("/", "layout");
    return NextResponse.json({ category });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    // Null out product references first, then delete category
    await db.product.updateMany({ where: { categoryId: id }, data: { categoryId: "" } }).catch(() => {});
    await db.category.delete({ where: { id } });
    bustCategoriesCache();
    bustProductsCache();
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Delete failed" }, { status: 500 });
  }
}
