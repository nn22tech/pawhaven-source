import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/session";

/** GET — staff only: list all orders */
export async function GET(req: NextRequest) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const orders = await db.order.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ orders });
}
