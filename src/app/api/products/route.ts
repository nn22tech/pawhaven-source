import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { slugify } from "@/lib/format";
import { bustProductsCache } from "@/lib/cache";

/** GET /api/products — public list with filters: category, type, search, featured */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const type = searchParams.get("type");
  const search = searchParams.get("search");
  const featured = searchParams.get("featured");

  const where: any = { status: "ACTIVE" };
  if (type) where.type = type;
  if (featured === "true") where.featured = true;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { breed: { contains: search } },
      { brand: { contains: search } },
    ];
  }
  if (category) {
    const cat = await db.category.findUnique({ where: { slug: category } });
    if (cat) where.categoryId = cat.id;
  }

  const products = await db.product.findMany({
    where,
    include: { media: { orderBy: { order: "asc" } }, category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ products });
}

/** POST /api/products — staff only (admin + moderator) */
export async function POST(req: NextRequest) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const slug = body.slug ? slugify(body.slug) : slugify(body.name) + "-" + Date.now().toString(36);
  const product = await db.product.create({
    data: {
      name: body.name,
      slug,
      description: body.description || "",
      price: Number(body.price),
      compareAtPrice: body.compareAtPrice ? Number(body.compareAtPrice) : null,
      type: body.type || "SUPPLY",
      breed: body.breed || null,
      age: body.age || null,
      color: body.color || null,
      gender: body.gender || null,
      vaccinated: body.vaccinated ?? null,
      neutered: body.neutered ?? null,
      brand: body.brand || null,
      stock: Number(body.stock) || 1,
      categoryId: body.categoryId,
      featured: Boolean(body.featured),
      status: body.status || "ACTIVE",
      media: body.media?.length
        ? { create: body.media.map((m: any, i: number) => ({
            url: m.url,
            type: m.type,
            order: i,
            isMain: i === 0,
          })) }
        : undefined,
    },
    include: { media: true, category: true },
  });
  bustProductsCache();
  return NextResponse.json({ product });
}
