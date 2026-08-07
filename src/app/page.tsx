import { db } from "@/lib/db";
import { getSiteSettings } from "@/lib/site-settings";
import { StorefrontApp } from "@/components/storefront/storefront-app";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [settings, categories, products] = await Promise.all([
    getSiteSettings(),
    db.category.findMany({ orderBy: { order: "asc" } }),
    db.product.findMany({
      where: { status: "ACTIVE" },
      include: { media: { orderBy: { order: "asc" } }, category: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <StorefrontApp
      settings={settings}
      categories={categories}
      products={products}
    />
  );
}
