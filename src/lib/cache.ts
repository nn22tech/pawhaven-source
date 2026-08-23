import { db } from "@/lib/db";

/**
 * Cached reads for storefront data.
 *
 * Neon's free tier has limited compute hours. These caches keep data in
 * memory for 2 minutes so page renders don't hit the database on every
 * request. Each cache has a `bust*` function called when the admin
 * modifies data.
 */

const TTL = 2 * 60 * 1000; // 2 minutes

let catCache: { data: any[] | null; ts: number } = { data: null, ts: 0 };
let prodCache: { data: any[] | null; ts: number } = { data: null, ts: 0 };

/** Public storefront categories (cached 2 min). */
export async function getCategories() {
  const now = Date.now();
  if (catCache.data && now - catCache.ts < TTL) return catCache.data;
  try {
    const categories = await db.category.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, slug: true, description: true, icon: true, order: true },
    });
    catCache = { data: categories, ts: now };
    return categories;
  } catch {
    return [];
  }
}

/** Public storefront products (cached 2 min). */
export async function getActiveProducts() {
  const now = Date.now();
  if (prodCache.data && now - prodCache.ts < TTL) return prodCache.data;
  try {
    const products = await db.product.findMany({
      where: { status: "ACTIVE" },
      include: {
        media: { orderBy: { order: "asc" }, select: { id: true, url: true, type: true, order: true, isMain: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    prodCache = { data: products, ts: now };
    return products;
  } catch {
    return [];
  }
}

export function bustCategoriesCache() {
  catCache = { data: null, ts: 0 };
}

export function bustProductsCache() {
  prodCache = { data: null, ts: 0 };
}

/** Bust all storefront caches (call after any admin product/category edit). */
export function bustAllCaches() {
  catCache = { data: null, ts: 0 };
  prodCache = { data: null, ts: 0 };
}
