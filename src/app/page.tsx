import { getSiteSettings } from "@/lib/site-settings";
import { getCategories, getActiveProducts } from "@/lib/cache";
import { StorefrontApp } from "@/components/storefront/storefront-app";

// ISR: regenerate the homepage every 5 minutes.
// Combined with the in-memory caches, this means a page view almost never
// hits Neon — perfect for the free tier.
export const revalidate = 300;

export default async function Home() {
  const [settings, categories, products] = await Promise.all([
    getSiteSettings(),
    getCategories(),
    getActiveProducts(),
  ]);

  return (
    <StorefrontApp
      settings={settings}
      categories={categories}
      products={products}
    />
  );
}
