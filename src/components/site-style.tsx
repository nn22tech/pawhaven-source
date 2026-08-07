import { fontVar } from "@/lib/site-settings";
import type { SiteSettings } from "@prisma/client";

/**
 * Injects admin-customized CSS variables (primary/accent colors, heading &
 * body fonts, border radius) into :root so the whole storefront reflects the
 * chosen theme. Runs server-side; settings are re-fetched on each request.
 */
export function SiteStyleInjector({ settings }: { settings: SiteSettings }) {
  const rules: string[] = [];
  if (settings.primaryColor) {
    rules.push(`--primary: ${settings.primaryColor} !important`);
  }
  if (settings.accentColor) {
    rules.push(`--accent: ${settings.accentColor} !important`);
    rules.push(`--ring: ${settings.accentColor} !important`);
  }
  if (settings.fontHeading && settings.fontHeading !== "geist") {
    rules.push(`--font-heading: ${fontVar(settings.fontHeading)}`);
  } else {
    rules.push(`--font-heading: var(--font-geist-sans)`);
  }
  if (settings.fontBody && settings.fontBody !== "geist") {
    rules.push(`--font-body: ${fontVar(settings.fontBody)}`);
  } else {
    rules.push(`--font-body: var(--font-geist-sans)`);
  }
  if (settings.borderRadius) {
    rules.push(`--radius: ${settings.borderRadius}`);
  }
  return (
    <style
       
      dangerouslySetInnerHTML={{
        __html: `:root{${rules.join(";")};}body{font-family:var(--font-body);}h1,h2,h3,h4,h5,h6{font-family:var(--font-heading);}`,
      }}
    />
  );
}
