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

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings();
  return {
    title: { default: `${s.siteName} — ${s.siteTagline}`, template: `%s | ${s.siteName}` },
    description: s.siteTagline,
    icons: s.faviconUrl ? { icon: s.faviconUrl } : undefined,
    openGraph: { title: s.siteName, description: s.siteTagline, siteName: s.siteName },
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
