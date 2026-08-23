import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/session";

/** POST /api/adoption — public submission of an adoption application */
export async function POST(req: NextRequest) {
  const body = await req.json();
  // Basic validation
  if (!body.fullName || !body.email || !body.location || !body.petType) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const app = await db.adoptionApplication.create({
    data: {
      fullName: String(body.fullName).slice(0, 120),
      email: String(body.email).slice(0, 160),
      phone: body.phone ? String(body.phone).slice(0, 40) : null,
      location: String(body.location).slice(0, 200),
      petType: String(body.petType).slice(0, 80),
      petColor: body.petColor ? String(body.petColor).slice(0, 80) : null,
      petAge: body.petAge ? String(body.petAge).slice(0, 60) : null,
      amount: body.amount ? Number(body.amount) : null,
      experience: body.experience ? String(body.experience).slice(0, 2000) : null,
      message: body.message ? String(body.message).slice(0, 4000) : null,
      productId: body.productId || null,
    },
  });
  return NextResponse.json({ application: app });
}

/** GET — staff only: list all adoption applications */
export async function GET(req: NextRequest) {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const applications = await db.adoptionApplication.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ applications });
}
