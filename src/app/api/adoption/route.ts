import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff } from "@/lib/session";
import { getSiteSettings } from "@/lib/site-settings";
import { sendEmail } from "@/lib/email";

/** POST /api/adoption — public submission of an adoption application */
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.fullName || !body.email || !body.location || !body.petType) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
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
      experience: body.experience
        ? String(body.experience).slice(0, 2000)
        : null,
      message: body.message ? String(body.message).slice(0, 4000) : null,
      productId: body.productId || null,
    },
  });

  // Send email notification to the store's order email
  const settings = await getSiteSettings();
  const subject = `New Adoption Application — ${body.fullName} (${body.petType})`;
  const textBody = [
    `New adoption application received!`,
    ``,
    `Applicant: ${body.fullName}`,
    `Email: ${body.email}`,
    body.phone ? `Phone: ${body.phone}` : "",
    `Location: ${body.location}`,
    ``,
    `Pet of Interest:`,
    `  Type/Breed: ${body.petType}`,
    body.petColor ? `  Color: ${body.petColor}` : "",
    body.petAge ? `  Age: ${body.petAge}` : "",
    body.amount ? `  Budget: $${body.amount}` : "",
    ``,
    body.experience ? `Experience:\n${body.experience}` : "",
    ``,
    body.message ? `Message:\n${body.message}` : "",
    ``,
    `Application ID: ${app.id}`,
    `Submitted: ${new Date().toLocaleString()}`,
    ``,
    `Review this application in your admin panel.`,
  ]
    .filter((line) => line !== "")
    .join("\n");

  const htmlBody = `
    <h2>New Adoption Application</h2>
    <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px;">
      <tr><td style="padding:4px 0;font-weight:bold;">Applicant:</td><td>${body.fullName}</td></tr>
      <tr><td style="padding:4px 0;font-weight:bold;">Email:</td><td>${body.email}</td></tr>
      ${body.phone ? `<tr><td style="padding:4px 0;font-weight:bold;">Phone:</td><td>${body.phone}</td></tr>` : ""}
      <tr><td style="padding:4px 0;font-weight:bold;">Location:</td><td>${body.location}</td></tr>
    </table>
    <h3 style="margin-top:20px;">Pet of Interest</h3>
    <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px;">
      <tr><td style="padding:4px 0;font-weight:bold;">Type/Breed:</td><td>${body.petType}</td></tr>
      ${body.petColor ? `<tr><td style="padding:4px 0;font-weight:bold;">Color:</td><td>${body.petColor}</td></tr>` : ""}
      ${body.petAge ? `<tr><td style="padding:4px 0;font-weight:bold;">Age:</td><td>${body.petAge}</td></tr>` : ""}
      ${body.amount ? `<tr><td style="padding:4px 0;font-weight:bold;">Budget:</td><td>$${body.amount}</td></tr>` : ""}
    </table>
    ${body.experience ? `<h3 style="margin-top:20px;">Experience</h3><p style="font-family:sans-serif;font-size:14px;">${body.experience}</p>` : ""}
    ${body.message ? `<h3 style="margin-top:20px;">Message</h3><p style="font-family:sans-serif;font-size:14px;">${body.message}</p>` : ""}
    <hr style="margin-top:20px;">
    <p style="font-family:sans-serif;font-size:12px;color:#888;">Application ID: ${app.id}<br>Submitted: ${new Date().toLocaleString()}</p>
  `;

  const emailResult = await sendEmail({
    to: settings.orderEmail,
    subject,
    text: textBody,
    html: htmlBody,
    replyTo: body.email,
  });

  return NextResponse.json({
    application: app,
    emailSent: emailResult.success,
    emailFallback: emailResult.mailto,
  });
}

/** GET — staff only: list all adoption applications */
export async function GET(req: NextRequest) {
  const user = await requireStaff();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const applications = await db.adoptionApplication.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ applications });
}
