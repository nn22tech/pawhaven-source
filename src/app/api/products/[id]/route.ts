import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { slugify } from "@/lib/format";
import { bustProductsCache } from "@/lib/cache";

/** GET /api/products/[id] — public single product */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = await db.product.findUnique({
    where: { id },
    include: { media: { orderBy: { order: "asc" } }, category: true },
  });
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ product });
}

/** PUT — staff only */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  // Replace media if provided
  if (Array.isArray(body.media)) {
    await db.productMedia.deleteMany({ where: { productId: id } });
    if (body.media.length) {
      await db.productMedia.createMany({
        data: body.media.map((m: any, i: number) => ({
          productId: id,
          url: m.url,
          type: m.type,
          order: i,
          isMain: i === 0,
        })),
      });
    }
  }

  const product = await db.product.update({
    where: { id },
    data: {
      name: body.name,
      slug: body.slug ? slugify(body.slug) : undefined,
      description: body.description,
      price: body.price !== undefined ? Number(body.price) : undefined,
      compareAtPrice: body.compareAtPrice === null ? null : body.compareAtPrice ? Number(body.compareAtPrice) : undefined,
      type: body.type,
      breed: body.breed ?? undefined,
      age: body.age ?? undefined,
      color: body.color ?? undefined,
      gender: body.gender ?? undefined,
      vaccinated: body.vaccinated ?? undefined,
      neutered: body.neutered ?? undefined,
      brand: body.brand ?? undefined,
      stock: body.stock !== undefined ? Number(body.stock) : undefined,
      categoryId: body.categoryId ?? undefined,
      featured: body.featured ?? undefined,
      status: body.status ?? undefined,
    },
    include: { media: { orderBy: { order: "asc" } }, category: true },
  });
  bustProductsCache();
  return NextResponse.json({ product });
}

/** DELETE — staff only */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await db.product.delete({ where: { id } });
  bustProductsCache();
  return NextResponse.json({ ok: true });
}
