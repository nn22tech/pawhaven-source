import { db } from "@/lib/db";
import type { SiteSettings } from "@prisma/client";

/** Cached singleton fetch of site-wide settings used across the storefront. */
let cache: { data: SiteSettings | null; ts: number } = { data: null, ts: 0 };
const TTL = 10_000; // 10s in-memory cache

/**
 * Safe default settings used when the database is unreachable
 * (e.g. during `next build` on Vercel, where no DB connection is available
 * at static-generation time). This prevents the build from failing.
 */
export const DEFAULT_SETTINGS: SiteSettings = {
  id: "singleton",
  siteName: "PawHaven",
  siteTagline: "Where Every Pet Finds a Home",
  logoUrl: null,
  faviconUrl: null,
  primaryColor: "",
  accentColor: "",
  fontHeading: "geist",
  fontBody: "geist",
  borderRadius: "0.625rem",
  heroTitle: "Find Your New Best Friend",
  heroSubtitle: "Adopt a loving pet or shop premium supplies — all in one warm, caring place.",
  heroImageUrl: null,
  heroCtaText: "Browse Pets",
  footerText: "© PawHaven. Where every paw finds a home.",
  contactEmail: "orders@pawhaven.example",
  contactPhone: null,
  address: null,
  socialFacebook: null,
  socialTwitter: null,
  socialInstagram: null,
  socialYoutube: null,
  showFeatured: true,
  showCategories: true,
  orderEmail: "orders@pawhaven.example",
  createdAt: new Date(0),
  updatedAt: new Date(0),
};

/**
 * Fetches site-wide settings. Returns safe defaults if the DB is
 * unreachable (e.g. during build-time static generation), so the build
 * never crashes. Real requests will hit the live DB.
 */
export async function getSiteSettings(): Promise<SiteSettings> {
  const now = Date.now();
  if (cache.data && now - cache.ts < TTL) return cache.data;
  try {
    let s = await db.siteSettings.findUnique({ where: { id: "singleton" } });
    if (!s) {
      s = await db.siteSettings.create({ data: { id: "singleton" } });
    }
    cache = { data: s, ts: now };
    return s;
  } catch {
    // DB not available (build time / cold start) — return defaults
    return DEFAULT_SETTINGS;
  }
}

export function bustSettingsCache() {
  cache = { data: null, ts: 0 };
}

/** Maps a stored font key to a Google/Geist font CSS variable name. */
export function fontVar(key: string): string {
  switch (key) {
    case "geist":
      return "var(--font-geist-sans)";
    case "mono":
      return "var(--font-geist-mono)";
    case "poppins":
      return "var(--font-poppins)";
    case "playfair":
      return "var(--font-playfair)";
    case "lora":
      return "var(--font-lora)";
    case "inter":
      return "var(--font-inter)";
    default:
      return "var(--font-geist-sans)";
  }
}
