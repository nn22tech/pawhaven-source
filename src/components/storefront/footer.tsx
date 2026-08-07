import { PawPrint, Mail, Phone, MapPin, Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import type { SiteSettings } from "@prisma/client";

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              {settings.logoUrl ? (
                 
                <img src={settings.logoUrl} alt={settings.siteName} className="h-7 w-7 rounded object-contain" />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <PawPrint className="h-4 w-4" />
                </span>
              )}
              <span className="text-lg font-bold" style={{ fontFamily: "var(--font-heading)" }}>
                {settings.siteName}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{settings.siteTagline}</p>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {settings.contactEmail && (
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> {settings.contactEmail}
                </li>
              )}
              {settings.contactPhone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" /> {settings.contactPhone}
                </li>
              )}
              {settings.address && (
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> {settings.address}
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Follow Us</h4>
            <div className="flex gap-3">
              {settings.socialInstagram && (
                <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-muted-foreground hover:text-foreground">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {settings.socialFacebook && (
                <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-muted-foreground hover:text-foreground">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {settings.socialTwitter && (
                <a href={settings.socialTwitter} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-muted-foreground hover:text-foreground">
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {settings.socialYoutube && (
                <a href={settings.socialYoutube} target="_blank" rel="noopener noreferrer" aria-label="Youtube" className="text-muted-foreground hover:text-foreground">
                  <Youtube className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Our Promise</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Healthy, vaccinated pets</li>
              <li>Premium quality supplies</li>
              <li>Loving, caring support</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-sm text-muted-foreground">
          {settings.footerText}
        </div>
      </div>
    </footer>
  );
}
