import { NextResponse } from "next/server";

/**
 * GET /api/debug-email
 * Temporary diagnostic endpoint — checks email config WITHOUT sending.
 * DELETE THIS FILE AFTER DEBUGGING.
 */
export async function GET() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL;

  return NextResponse.json({
    config: {
      RESEND_API_KEY: apiKey ? `✓ Set (starts with: ${apiKey.substring(0, 6)}...)` : "✗ NOT SET",
      FROM_EMAIL: fromEmail || "✗ NOT SET (will use default onboarding@resend.dev)",
      NODE_ENV: process.env.NODE_ENV,
    },
    diagnosis: !apiKey
      ? "❌ RESEND_API_KEY is NOT set. Add it in Vercel → Settings → Environment Variables, check ALL environments, then redeploy."
      : !fromEmail
      ? "⚠️ RESEND_API_KEY is set, but FROM_EMAIL is not set. Add it as: 'Your Store <noreply@yourdomain.com>'"
      : "✅ Both env vars are set. If emails still don't send, the issue is with your Resend domain verification or API key validity.",
  });
}
