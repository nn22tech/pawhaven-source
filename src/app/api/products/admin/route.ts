import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/session";

/** GET /api/products/admin — staff only: all products regardless of status. */
export async function GET(req: NextRequest) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const where: any = {};
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
      { breed: { contains: search } },
      { brand: { contains: search } },
    ];
  }
  const products = await db.product.findMany({
    where,
    include: { media: { orderBy: { order: "asc" } }, category: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ products });
}
