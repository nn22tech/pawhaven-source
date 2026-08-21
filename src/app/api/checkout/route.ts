import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/site-settings";
import { sendEmail } from "@/lib/email";
import { formatCurrency } from "@/lib/format";

/**
 * POST /api/checkout
 * Body: { customer: { name, email, phone, location, notes }, items: CartItem[] }
 * Persists the order AND sends an email to the store's order email.
 * Returns a mailto link as fallback if email sending fails.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const customer = body.customer || {};
  const items: any[] = Array.isArray(body.items) ? body.items : [];

  if (!customer.name || !customer.email || !items.length) {
    return NextResponse.json(
      { error: "Missing customer or items" },
      { status: 400 },
    );
  }

  const total = items.reduce((n, i) => n + i.qty * i.price, 0);
  const settings = await getSiteSettings();

  const order = await db.order.create({
    data: {
      customerName: String(customer.name).slice(0, 120),
      customerEmail: String(customer.email).slice(0, 160),
      customerPhone: customer.phone
        ? String(customer.phone).slice(0, 40)
        : null,
      customerLocation: customer.location
        ? String(customer.location).slice(0, 200)
        : null,
      items: JSON.stringify(items),
      total,
      notes: customer.notes ? String(customer.notes).slice(0, 2000) : null,
      status: "PENDING",
    },
  });

  // Build email content
  const itemLines = items.map(
    (i) =>
      `• ${i.name} (${i.type}) — ${i.qty} × ${formatCurrency(i.price)} = ${formatCurrency(i.qty * i.price)}`,
  );
  const subject = `New Order #${order.id.slice(-6).toUpperCase()} — ${settings.siteName}`;
  const textBody = [
    `New order received!`,
    ``,
    `Customer: ${customer.name}`,
    `Email: ${customer.email}`,
    customer.phone ? `Phone: ${customer.phone}` : "",
    customer.location ? `Location: ${customer.location}` : "",
    ``,
    `Items:`,
    ...itemLines,
    ``,
    `Order Total: ${formatCurrency(total)}`,
    `Order Reference: #${order.id.slice(-6).toUpperCase()}`,
    customer.notes ? `Notes: ${customer.notes}` : "",
    ``,
    `Submitted: ${new Date().toLocaleString()}`,
  ]
    .filter(Boolean)
    .join("\n");

  const htmlBody = `
    <h2>New Order #${order.id.slice(-6).toUpperCase()}</h2>
    <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px;">
      <tr><td style="padding:4px 0;font-weight:bold;">Customer:</td><td>${customer.name}</td></tr>
      <tr><td style="padding:4px 0;font-weight:bold;">Email:</td><td>${customer.email}</td></tr>
      ${customer.phone ? `<tr><td style="padding:4px 0;font-weight:bold;">Phone:</td><td>${customer.phone}</td></tr>` : ""}
      ${customer.location ? `<tr><td style="padding:4px 0;font-weight:bold;">Location:</td><td>${customer.location}</td></tr>` : ""}
    </table>
    <h3 style="margin-top:20px;">Items</h3>
    <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px;">
      <tr style="border-bottom:1px solid #ddd;"><th style="text-align:left;padding:8px 0;">Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
      ${items
        .map(
          (i) =>
            `<tr style="border-bottom:1px solid #eee;"><td style="padding:8px 0;">${i.name} <small>(${i.type})</small></td><td style="text-align:center;">${i.qty}</td><td style="text-align:right;">${formatCurrency(i.price)}</td><td style="text-align:right;">${formatCurrency(i.qty * i.price)}</td></tr>`,
        )
        .join("")}
      <tr style="font-weight:bold;border-top:2px solid #333;"><td colspan="3" style="padding:8px 0;text-align:right;">Total:</td><td style="text-align:right;">${formatCurrency(total)}</td></tr>
    </table>
    ${customer.notes ? `<h3 style="margin-top:20px;">Notes</h3><p style="font-family:sans-serif;font-size:14px;">${customer.notes}</p>` : ""}
    <hr style="margin-top:20px;">
    <p style="font-family:sans-serif;font-size:12px;color:#888;">Order ID: ${order.id}<br>Submitted: ${new Date().toLocaleString()}</p>
  `;

  // Send email to store
  const emailResult = await sendEmail({
    to: settings.orderEmail,
    subject,
    text: textBody,
    html: htmlBody,
    replyTo: customer.email,
  });

  // Build customer mailto as fallback / alternative
  const customerMailto = `mailto:${settings.orderEmail}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(textBody)}`;

  return NextResponse.json({
    order,
    emailSent: emailResult.success,
    mailto: customerMailto,
    subject,
    body: textBody,
  });
}
