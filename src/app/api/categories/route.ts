import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { slugify } from "@/lib/format";
import { bustCategoriesCache } from "@/lib/cache";

/** GET — public list of categories */
export async function GET() {
  const categories = await db.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return NextResponse.json({ categories });
}

/** POST — staff only */
export async function POST(req: NextRequest) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const slug = body.slug ? slugify(body.slug) : slugify(body.name);
  const category = await db.category.create({
    data: {
      name: body.name,
      slug,
      description: body.description || null,
      icon: body.icon || null,
      order: Number(body.order) || 0,
    },
  });
  bustCategoriesCache();
  return NextResponse.json({ category });
}
