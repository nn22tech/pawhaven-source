/**
 * Email helper — sends emails via Resend's REST API (no package needed).
 *
 * SETUP (optional but recommended for direct email delivery):
 *   1. Sign up at https://resend.com (free tier: 100 emails/day)
 *   2. Get your API key
 *   3. Set environment variables:
 *        RESEND_API_KEY=re_xxxxx
 *        FROM_EMAIL=Your Store <noreply@yourdomain.com>
 *
 * If RESEND_API_KEY is not set, sendEmail returns { success: false }
 * and callers should fall back to a mailto: link.
 */

interface EmailResult {
  success: boolean;
  error?: string;
  mailto?: string; // fallback link if email couldn't be sent
}

export async function sendEmail(params: {
  to: string;
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}): Promise<EmailResult> {
  const { to, subject, text, html, replyTo } = params;
  const apiKey = process.env.RESEND_API_KEY;

  // No API key configured — return a mailto fallback
  if (!apiKey) {
    const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    return { success: false, error: "RESEND_API_KEY not configured", mailto };
  }

  try {
    const fromEmail = process.env.FROM_EMAIL || "PawHaven <onboarding@resend.dev>";

    const body: any = {
      from: fromEmail,
      to: [to],
      subject,
      text,
    };
    if (html) body.html = html;
    if (replyTo) body.reply_to = replyTo;

    // Add a timeout (8 seconds) so the serverless function doesn't hang
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      console.error("Email send failed:", res.status, errText);
      const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
      return { success: false, error: `Resend API error ${res.status}: ${errText}`, mailto };
    }

    return { success: true };
  } catch (e: any) {
    console.error("Email send error:", e.message);
    const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    if (e.name === "AbortError") {
      return { success: false, error: "Request timed out (8s)", mailto };
    }
    return { success: false, error: e.message, mailto };
  }
}
