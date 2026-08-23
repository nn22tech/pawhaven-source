import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/site-settings";
import { formatCurrency } from "@/lib/format";

/**
 * POST /api/checkout
 * Body: { customer: { name, email, phone, location, notes }, items: CartItem[] }
 * Persists the order and returns a prewritten email body + mailto link that
 * opens the user's email client addressed to the store's order email.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const customer = body.customer || {};
  const items: any[] = Array.isArray(body.items) ? body.items : [];

  if (!customer.name || !customer.email || !items.length) {
    return NextResponse.json({ error: "Missing customer or items" }, { status: 400 });
  }

  const total = items.reduce((n, i) => n + i.qty * i.price, 0);
  const settings = await getSiteSettings();

  const order = await db.order.create({
    data: {
      customerName: String(customer.name).slice(0, 120),
      customerEmail: String(customer.email).slice(0, 160),
      customerPhone: customer.phone ? String(customer.phone).slice(0, 40) : null,
      customerLocation: customer.location ? String(customer.location).slice(0, 200) : null,
      items: JSON.stringify(items),
      total,
      notes: customer.notes ? String(customer.notes).slice(0, 2000) : null,
      status: "PENDING",
    },
  });

  // Build a friendly, prewritten order email
  const lines = items.map(
    (i) =>
      `• ${i.name} (${i.type}) — ${i.qty} × ${formatCurrency(i.price)} = ${formatCurrency(i.qty * i.price)}`
  );
  const subject = `New Order #${order.id.slice(-6).toUpperCase()} — ${settings.siteName}`;
  const textBody = [
    `Hello ${settings.siteName} Team,`,
    ``,
    `I would like to place the following order:`,
    ``,
    ...lines,
    ``,
    `Order Total: ${formatCurrency(total)}`,
    `Order Reference: #${order.id.slice(-6).toUpperCase()}`,
    ``,
    `My Details:`,
    `Name: ${customer.name}`,
    `Email: ${customer.email}`,
    customer.phone ? `Phone: ${customer.phone}` : null,
    customer.location ? `Location: ${customer.location}` : null,
    customer.notes ? `Notes: ${customer.notes}` : null,
    ``,
    `Thank you!`,
  ]
    .filter(Boolean)
    .join("\n");

  const mailto = `mailto:${settings.orderEmail}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(textBody)}`;

  return NextResponse.json({ order, mailto, subject, body: textBody });
}
