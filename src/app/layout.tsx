import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins, Playfair_Display, Lora, Inter } from "next/font/google";
import "./globals.css";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Providers } from "@/lib/providers";
import { getSiteSettings } from "@/lib/site-settings";
import { SiteStyleInjector } from "@/components/site-style";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const lora = Lora({ variable: "--font-lora", subsets: ["latin"], weight: ["400", "500", "600"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });

// ISR: regenerate pages every 5 minutes — drastically reduces Neon
// compute usage on the free tier. Combined with in-memory caches, a
// page view almost never hits the database.
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();

  // Use the site's logo or hero image as the social preview image
  const ogImage = s.heroImageUrl || s.logoUrl || undefined;
  const title = `${s.siteName} — ${s.siteTagline}`;

  return {
    metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
    title: {
      default: title,
      template: `%s | ${s.siteName}`,
    },
    description: s.siteTagline,
    applicationName: s.siteName,
    icons: s.faviconUrl ? { icon: s.faviconUrl } : undefined,
    openGraph: {
      title: title,
      description: s.siteTagline,
      siteName: s.siteName,
      type: "website",
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: s.siteName }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: s.siteTagline,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings();
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${playfair.variable} ${lora.variable} ${inter.variable}`}
    >
      <body className="antialiased bg-background text-foreground">
        <Providers>
          <SiteStyleInjector settings={settings} />
          {children}
          <Sonner />
        </Providers>
      </body>
    </html>
  );
}
