import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings } from "@/lib/site-settings";
import { sendEmail } from "@/lib/email";

/**
 * POST /api/contact — public contact/info request form.
 * Sends the message to the store's contact email.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!body.name || !body.email || !body.message) {
    return NextResponse.json({ error: "Name, email and message are required" }, { status: 400 });
  }

  const settings = await getSiteSettings();
  const subject = `New Inquiry from ${body.name} — ${settings.siteName}`;
  const textBody = [
    `New message from your website contact form.`,
    ``,
    `Name: ${body.name}`,
    `Email: ${body.email}`,
    body.phone ? `Phone: ${body.phone}` : "",
    ``,
    `Message:`,
    body.message,
    ``,
    `Sent: ${new Date().toLocaleString()}`,
  ]
    .filter(Boolean)
    .join("\n");

  const htmlBody = `
    <h2>New Contact Form Message</h2>
    <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px;">
      <tr><td style="padding:4px 0;font-weight:bold;">Name:</td><td>${body.name}</td></tr>
      <tr><td style="padding:4px 0;font-weight:bold;">Email:</td><td>${body.email}</td></tr>
      ${body.phone ? `<tr><td style="padding:4px 0;font-weight:bold;">Phone:</td><td>${body.phone}</td></tr>` : ""}
    </table>
    <h3 style="margin-top:20px;">Message</h3>
    <p style="font-family:sans-serif;font-size:14px;white-space:pre-line;">${body.message}</p>
    <hr style="margin-top:20px;">
    <p style="font-family:sans-serif;font-size:12px;color:#888;">Sent: ${new Date().toLocaleString()}</p>
  `;

  const result = await sendEmail({
    to: settings.contactEmail,
    subject,
    text: textBody,
    html: htmlBody,
    replyTo: body.email,
  });

  if (result.success) {
    return NextResponse.json({ success: true, message: "Message sent successfully" });
  }

  // Fallback: return a mailto link
  return NextResponse.json({
    success: false,
    mailto: result.mailto,
    message: "Email service not configured. Use the mailto link to send.",
  });
}
