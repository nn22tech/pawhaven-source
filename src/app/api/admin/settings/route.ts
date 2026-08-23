import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaff, requireAdmin } from "@/lib/session";
import { getSiteSettings, bustSettingsCache } from "@/lib/site-settings";
import { revalidatePath } from "next/cache";

/** GET — staff can read settings (needed to render panels). */
export async function GET() {
  const user = await requireStaff();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}

/** PUT — admin only: update site-wide customization. */
export async function PUT(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const allowed = [
    "siteName","siteTagline","logoUrl","faviconUrl","primaryColor","accentColor",
    "fontHeading","fontBody","borderRadius","heroTitle","heroSubtitle","heroImageUrl",
    "heroCtaText","footerText","contactEmail","contactPhone","address",
    "socialFacebook","socialTwitter","socialInstagram","socialYoutube",
    "showFeatured","showCategories","orderEmail",
  ];
  const data: any = {};
  for (const k of allowed) {
    if (body[k] !== undefined) data[k] = body[k];
  }
  try {
    await db.siteSettings.update({
      where: { id: "singleton" },
      data,
    });
    bustSettingsCache();
    // Instantly refresh the storefront so admin edits (footer, images,
    // colors, fonts) appear immediately instead of waiting for ISR.
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("Settings update failed:", e);
    return NextResponse.json({ error: e.message || "Update failed" }, { status: 500 });
  }
}
